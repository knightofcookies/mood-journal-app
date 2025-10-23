import type { PageServerLoad, Actions } from './$types';
import { validateSessionToken } from '$lib/server/auth';
import { redirect, json, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq } from 'drizzle-orm';
import * as v from 'valibot';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('auth-session');
	const { user } = await validateSessionToken(token || '');
	if (!user) throw redirect(303, '/auth/login');
	const rows = await db
		.select()
		.from(table.entry)
		.where(eq(table.entry.userId, user.id))
		.orderBy(desc(table.entry.created_at))
		.limit(20);
	const entries = rows.map((entry) => ({
		...entry,
		html: sanitizeHtml(String(marked.parse(entry.content)), {
			allowedTags: sanitizeHtml.defaults.allowedTags.concat(['audio', 'source']),
			allowedAttributes: {
				...sanitizeHtml.defaults.allowedAttributes,
				audio: ['controls', 'src'],
				source: ['src'],
				img: ['src', 'alt', 'title', 'class']
			}
		})
	}));
	return { user, entries };
};

const CreateSchema = v.object({
	content: v.pipe(v.string(), v.minLength(1)),
	mood: v.string()
});

export const actions: Actions = {
	create: async ({ request, cookies }) => {
		const token = cookies.get('auth-session');
		const { user } = await validateSessionToken(token || '');
		if (!user) return fail(401, { error: 'unauthorized' });

		const form = await request.formData();
		const data = {
			content: String(form.get('content') || ''),
			mood: String(form.get('mood') || 'neutral')
		};
		const parsed = v.safeParse(CreateSchema, data);
		if (!parsed.success) return fail(400, { error: 'invalid' });

		const id = crypto.randomUUID();
		const now = new Date();
		await db.insert(table.entry).values({
			id,
			userId: user.id,
			content: parsed.output.content,
			mood: parsed.output.mood,
			created_at: now,
			updated_at: now
		});
		return json({ ok: true, id });
	}
};
