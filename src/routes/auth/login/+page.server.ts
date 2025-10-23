import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { sha256 } from '@oslojs/crypto/sha2';
import { encodeHexLowerCase } from '@oslojs/encoding';
import { createSession, generateSessionToken, sessionCookieName } from '$lib/server/auth';
import { allow, reset } from '$lib/server/rateLimit';
import { env } from '$env/dynamic/private';
import path from 'path';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect authenticated users away from login page
	if (locals.user) {
		throw redirect(303, '/journal');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		try {
			const resolved = path.resolve(process.cwd(), String(env.DATABASE_URL || ''));
			console.log(
				'[auth] login handler start - env.DATABASE_URL:',
				env.DATABASE_URL,
				'resolved:',
				resolved,
				'cwd:',
				process.cwd()
			);
		} catch (e) {
			console.error('[auth] error resolving DB path', e);
		}
		const form = await request.formData();
		const email = String(form.get('email') || '');
		const password = String(form.get('password') || '');

		const ip =
			request.headers.get('x-forwarded-for') ||
			request.headers.get('x-real-ip') ||
			request.headers.get('remote_addr') ||
			'local';
		if (!allow(ip, 50, 60_000)) {
			return fail(429, {
				message: 'Too many login attempts. Please wait a moment before trying again.'
			});
		}

		if (!email || !password) {
			const missing = [];
			if (!email) missing.push('email');
			if (!password) missing.push('password');
			return fail(400, { message: `Please provide your ${missing.join(' and ')}` });
		}

		const [row] = await db
			.select({
				id: table.user.id,
				password_hash: table.user.password_hash,
				failed_attempts: table.user.failed_attempts,
				locked_until: table.user.locked_until
			})
			.from(table.user)
			.where(eq(table.user.email, email));
		if (!row) {
			return fail(400, { message: 'This user does not exist' });
		}

		// check locked_until
		const rawLocked = row.locked_until;
		let lockedUntil: number;
		if (rawLocked instanceof Date) {
			lockedUntil = rawLocked.getTime();
		} else if (typeof rawLocked === 'number') {
			// drizzle/sqlite timestamp mode may return seconds; normalize to ms
			lockedUntil = rawLocked > 1e12 ? rawLocked : rawLocked * 1000;
		} else {
			// string or other
			lockedUntil = new Date(String(rawLocked)).getTime();
		}

		if (lockedUntil > Date.now()) {
			console.log('[auth] rejecting login - account locked', {
				id: row.id,
				lockedUntil,
				now: Date.now()
			});
			return fail(403, {
				message:
					'Account temporarily locked due to too many failed attempts. Please try again later.'
			});
		}

		const { verify } = await import('argon2');
		const ok = await verify(row.password_hash, password);
		console.log('[auth] password verify result for user', row.id, ok);
		if (!ok) {
			// increment failed_attempts
			const attempts = (row.failed_attempts || 0) + 1;
			const updates: { failed_attempts: number; locked_until?: Date } = {
				failed_attempts: attempts
			};
			const LOCK_THRESHOLD = 5;
			const LOCK_MINUTES = 15;
			if (attempts >= LOCK_THRESHOLD) {
				updates.locked_until = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
			}
			await db.update(table.user).set(updates).where(eq(table.user.id, row.id));

			return fail(400, { message: 'Incorrect password. Please try again.' });
		}

		// Perform an atomic reset + session creation on the same SQLite client to ensure visibility
		const expiresAtMs = Date.now() + 1000 * 60 * 60 * 24 * 30; // ms
		let finalToken: string | null = null;

		try {
			// Drizzle with better-sqlite3 requires a synchronous transaction callback (cannot return a promise)
			db.transaction((tx) => {
				tx.update(table.user)
					.set({ failed_attempts: 0, locked_until: new Date(0) })
					.where(eq(table.user.id, row.id))
					.run();

				// Insert session, retrying on unlikely primary-key collisions
				let tries = 0;
				while (tries < 5) {
					tries += 1;
					const token = generateSessionToken();
					const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
					try {
						tx.insert(table.session)
							.values({ id: sessionId, userId: row.id, expiresAt: new Date(expiresAtMs) })
							.run();
						// success — remember token to set cookie after txn
						finalToken = token;
						break;
					} catch (e: unknown) {
						// on primary key collision, retry; otherwise rethrow
						if ((e as { code?: string })?.code === 'SQLITE_CONSTRAINT_PRIMARYKEY' && tries < 5) {
							continue;
						}
						throw e;
					}
				}
			});

			// set cookie with token (from the successful insert)
			if (finalToken) {
				cookies.set(sessionCookieName, finalToken, { expires: new Date(expiresAtMs), path: '/' });
			} else {
				// fallback if we somehow didn't create a session inside txn
				throw new Error('failed to create session inside transaction');
			}
			if (process.env.DEBUG_AUTH)
				console.log('[auth] atomic reset + session creation complete for user', row.id, {
					expiresAtMs
				});
		} catch (err) {
			console.error('[auth] error running atomic reset + session creation', err);
			// fallback: attempt to create session via Drizzle
			try {
				const fbToken = generateSessionToken();
				const session = await createSession(fbToken, row.id);
				cookies.set(sessionCookieName, fbToken, { expires: session.expiresAt, path: '/' });
			} catch (e) {
				console.error('[auth] fallback createSession failed', e);
			}
		}
		// reset ip limiter
		reset(ip);

		try {
			const [fresh] = await db
				.select({
					id: table.user.id,
					failed_attempts: table.user.failed_attempts,
					locked_until: table.user.locked_until
				})
				.from(table.user)
				.where(eq(table.user.id, row.id));
			console.log('[auth] post-login user row:', {
				id: fresh?.id,
				failed_attempts: fresh?.failed_attempts,
				locked_until: fresh?.locked_until
			});
		} catch (err) {
			console.error('[auth] error selecting user after reset', err);
		}

		throw redirect(303, '/journal');
	}
};
