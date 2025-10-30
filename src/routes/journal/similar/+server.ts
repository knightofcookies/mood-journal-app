import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { findSimilarEntries } from '$lib/server/nlp';

export const GET: RequestHandler = async ({ locals, url }) => {
	const user = locals.user;
	if (!user?.id) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const entryId = url.searchParams.get('entryId');
	if (!entryId) {
		return json({ error: 'Entry ID required' }, { status: 400 });
	}

	// Get the target entry and its tags
	const [targetEntry] = await db
		.select()
		.from(table.entry)
		.where(eq(table.entry.id, entryId))
		.limit(1);

	if (!targetEntry || targetEntry.userId !== user.id) {
		return json({ error: 'Entry not found' }, { status: 404 });
	}

	// Get tags for target entry
	const targetTags = await db
		.select({ tagName: table.tag.name })
		.from(table.entryTag)
		.innerJoin(table.tag, eq(table.entryTag.tagId, table.tag.id))
		.where(eq(table.entryTag.entryId, entryId));

	const targetKeywords = targetTags.map((t) => t.tagName);

	if (targetKeywords.length === 0) {
		return json([]);
	}

	// Get all other entries for this user
	const otherEntries = await db.select().from(table.entry).where(eq(table.entry.userId, user.id));

	// Get tags for all entries except target
	const entryIds = otherEntries.map((e) => e.id).filter((id) => id !== entryId);

	if (entryIds.length === 0) {
		return json([]);
	}

	const allTags = await db
		.select({
			entryId: table.entryTag.entryId,
			tagName: table.tag.name
		})
		.from(table.entryTag)
		.innerJoin(table.tag, eq(table.entryTag.tagId, table.tag.id))
		.where(inArray(table.entryTag.entryId, entryIds));

	// Group tags by entry
	const tagsByEntry = new Map<string, string[]>();
	allTags.forEach(({ entryId, tagName }) => {
		if (!tagsByEntry.has(entryId)) {
			tagsByEntry.set(entryId, []);
		}
		tagsByEntry.get(entryId)!.push(tagName);
	});

	// Prepare entries for similarity search
	const entriesWithKeywords = otherEntries
		.filter((e) => e.id !== entryId)
		.map((e) => ({
			id: e.id,
			keywords: tagsByEntry.get(e.id) || [],
			content: e.content,
			created_at: e.createdAt
		}));

	// Find similar entries
	const similar = findSimilarEntries(targetKeywords, entriesWithKeywords, 3);

	// Fetch full entry data for similar entries
	if (similar.length === 0) return json([]);

	const similarIds = similar.map((s) => s.id);
	const similarEntries = await db
		.select()
		.from(table.entry)
		.where(inArray(table.entry.id, similarIds));

	const result = similarEntries.map((entry) => {
		const simData = similar.find((s) => s.id === entry.id)!;
		return {
			id: entry.id,
			content: entry.content,
			mood: entry.mood,
			created_at: entry.createdAt,
			similarity: Math.round(simData.similarity * 100),
			preview: simData.preview
		};
	});

	return json(result);
};
