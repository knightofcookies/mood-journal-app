import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect, fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	change_password: async ({ request, locals }) => {
		if (!locals.user) throw redirect(303, '/auth/login');
		const form = await request.formData();
		const current = String(form.get('current_password') || '');
		const next = String(form.get('new_password') || '');
		if (next.length < 8) return fail(400, { message: 'Password too short' });
		const [row] = await db
			.select({ id: table.user.id, password_hash: table.user.password_hash })
			.from(table.user)
			.where(eq(table.user.id, locals.user.id));
		if (!row) return fail(400, { message: 'User not found' });
		const { verify, hash } = await import('argon2');
		const ok = await verify(row.password_hash, current);
		if (!ok) return fail(400, { message: 'Current password incorrect' });
		const newHash = await hash(next);
		await db
			.update(table.user)
			.set({ password_hash: newHash })
			.where(eq(table.user.id, locals.user.id));
		return { ok: true };
	}
};
