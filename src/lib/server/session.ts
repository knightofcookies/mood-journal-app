import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export type SessionUser = {
	id: string;
	name: string | null;
	username: string;
	email: string;
	avatarUrl: string | null;
};

export async function createSession(userId: string, cookies: Cookies): Promise<string> {
	const sessionToken = crypto.randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_DURATION);

	await db.insert(table.session).values({
		sessionToken,
		userId,
		expires: expiresAt
	});

	cookies.set(SESSION_COOKIE_NAME, sessionToken, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: SESSION_DURATION / 1000
	});

	return sessionToken;
}

export async function getSession(cookies: Cookies): Promise<SessionUser | null> {
	const sessionToken = cookies.get(SESSION_COOKIE_NAME);
	if (!sessionToken) return null;

	const [session] = await db
		.select()
		.from(table.session)
		.where(eq(table.session.sessionToken, sessionToken))
		.limit(1);

	if (!session || session.expires < new Date()) {
		if (session) {
			await deleteSession(sessionToken);
		}
		return null;
	}

	const [user] = await db
		.select({
			id: table.user.id,
			name: table.user.name,
			username: table.user.username,
			email: table.user.email,
			avatarUrl: table.user.avatarUrl
		})
		.from(table.user)
		.where(eq(table.user.id, session.userId))
		.limit(1);

	return user || null;
}

export async function deleteSession(sessionToken: string): Promise<void> {
	await db.delete(table.session).where(eq(table.session.sessionToken, sessionToken));
}

export async function clearSession(cookies: Cookies): Promise<void> {
	const sessionToken = cookies.get(SESSION_COOKIE_NAME);
	if (sessionToken) {
		await deleteSession(sessionToken);
	}
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}
