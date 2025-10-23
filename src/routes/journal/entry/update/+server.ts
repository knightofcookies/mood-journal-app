import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { validateSessionToken } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const id = String(form.get('id') || '');
	const content = String(form.get('content') || '');
	const mood = String(form.get('mood') || 'neutral');

	const token = cookies.get('auth-session');
	const { user } = await validateSessionToken(token || '');
	if (!user)
		return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401 });

	const now = new Date();
	try {
		await db
			.update(table.entry)
			.set({ content, mood, updated_at: now })
			.where(and(eq(table.entry.id, id), eq(table.entry.userId, user.id)));
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error('update entry failed', err);
		return new Response(JSON.stringify({ ok: false, error: 'update_failed' }), { status: 500 });
	}
};
