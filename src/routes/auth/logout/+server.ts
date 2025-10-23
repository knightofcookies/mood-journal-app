import { invalidateSession, sessionCookieName } from '$lib/server/auth';
import { json, redirect } from '@sveltejs/kit';

export async function POST({ cookies, request }) {
	const token = cookies.get(sessionCookieName);
	if (token) {
		// compute session id and delete
		const { encodeHexLowerCase } = await import('@oslojs/encoding');
		const { sha256 } = await import('@oslojs/crypto/sha2');
		const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
		await invalidateSession(sessionId);
		cookies.delete(sessionCookieName, { path: '/' });
	}

	const isJson = (request.headers.get('accept') || '').includes('application/json');
	if (isJson) return json({ ok: true });
	throw redirect(303, '/auth/login');
}
