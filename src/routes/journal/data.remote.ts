import { query, form } from '$app/server';
import * as v from 'valibot';
import { db } from '$lib/server/db';
import { desc } from 'drizzle-orm';
import * as table from '$lib/server/db/schema';
import { getRequestEvent } from '$app/server';
import { validateSessionToken } from '$lib/server/auth';
import { allow as allowRate } from '$lib/server/rateLimit';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export const listEntries = query(async () => {
	// For demo: return latest 20 entries ordered by created_at
	const rows = await db.select().from(table.entry).orderBy(desc(table.entry.created_at)).limit(20);
	// Sanitize HTML server-side
	const entries = rows.map((row) => ({
		...row,
		html: sanitizeHtml(marked.parse(row.content) as string, {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(['audio', 'source']),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				audio: ['controls', 'src'],
				source: ['src', 'type']
			}
		})
	}));
	return entries;
});

export const createEntry = form(
	v.object({ content: v.string(), mood: v.string() }),
	async (data) => {
		const event = getRequestEvent();
		const token = event.cookies.get('auth-session');
		const { user } = await validateSessionToken(token || '');
		if (!user) throw new Error('Unauthorized');

		// Basic rate limit: 60 creates per minute per IP
		const ip = event.getClientAddress?.() ?? 'unknown';
		const ok = await allowRate(String(ip), 60, 60_000);
		if (!ok) throw new Error('rate_limited');

		const id = crypto.randomUUID();
		const now = new Date();
		await db.insert(table.entry).values({
			id,
			userId: user.id,
			content: data.content,
			mood: data.mood,
			created_at: now,
			updated_at: now
		});
		return { id };
	}
);
