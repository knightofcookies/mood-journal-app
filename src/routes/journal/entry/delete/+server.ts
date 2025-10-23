import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { validateSessionToken } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, cookies }) => {
	const form = await request.formData();
	const id = String(form.get('id') || '');
	const token = cookies.get('auth-session');
	const { user } = await validateSessionToken(token || '');
	if (!user)
		return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), { status: 401 });

	try {
		await db
			.delete(table.entry)
			.where(and(eq(table.entry.id, id), eq(table.entry.userId, user.id)));
		return new Response(JSON.stringify({ ok: true }), { status: 200 });
	} catch (err) {
		console.error('delete entry failed', err);
		return new Response(JSON.stringify({ ok: false, error: 'delete_failed' }), { status: 500 });
	}
};
