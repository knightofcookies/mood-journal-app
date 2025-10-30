import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { entry, tag, entryTag } from '$lib/server/db/schema';
import { eq, inArray, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	if (!user?.id) {
		throw new Error('Unauthorized');
	}

	// Get all entries with their tags
	const entries = await db
		.select({
			id: entry.id,
			content: entry.content,
			mood: entry.mood,
			sentimentScore: entry.sentimentScore,
			sentimentLabel: entry.sentimentLabel,
			createdAt: entry.createdAt
		})
		.from(entry)
		.where(eq(entry.userId, user.id))
		.orderBy(desc(entry.createdAt));

	// Get all unique tags for suggestions
	const allTagsData = await db
		.select({
			tagId: entryTag.tagId,
			tagName: tag.name,
			tagType: tag.type
		})
		.from(entryTag)
		.innerJoin(entry, eq(entryTag.entryId, entry.id))
		.innerJoin(tag, eq(entryTag.tagId, tag.id))
		.where(eq(entry.userId, user.id));

	// Get unique tags
	const uniqueTags = Array.from(
		new Map(allTagsData.map((t) => [t.tagName, { name: t.tagName, type: t.tagType }])).values()
	);

	return {
		entries,
		tags: uniqueTags
	};
};
