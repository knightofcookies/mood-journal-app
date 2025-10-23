import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { createSession, generateSessionToken, sessionCookieName } from '$lib/server/auth';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect authenticated users away from register page
	if (locals.user) {
		throw redirect(303, '/journal');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await request.formData();
		const username = String(form.get('username') || '');
		const email = String(form.get('email') || '');
		const password = String(form.get('password') || '');

		// validate (simple checks)
		const errors = [];
		if (username.length < 2) errors.push('Username must be at least 2 characters');
		if (email.length < 5 || !email.includes('@')) errors.push('Please enter a valid email address');
		if (password.length < 8) errors.push('Password must be at least 8 characters');

		if (errors.length > 0) {
			return fail(400, { message: errors.join('. ') });
		}

		// check uniqueness
		const [existing] = await db
			.select({ id: table.user.id })
			.from(table.user)
			.where(eq(table.user.email, email));
		if (existing) {
			return fail(400, { message: 'This user already exists' });
		}

		// use argon2 to hash password
		const { hash } = await import('argon2');
		const passwordHash = await hash(password);
		const id = crypto.randomUUID();
		const now = new Date();

		await db
			.insert(table.user)
			.values({ id, username, email, password_hash: passwordHash, created_at: now });

		// create session and set cookie
		const token = generateSessionToken();
		const session = await createSession(token, id);
		cookies.set(sessionCookieName, token, { expires: session.expiresAt, path: '/' });

		throw redirect(303, '/journal');
	}
};
