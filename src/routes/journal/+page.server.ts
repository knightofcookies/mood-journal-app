import type { PageServerLoad } from './$types';
import { validateSessionToken } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { desc, eq, like, and } from 'drizzle-orm';

export const load: PageServerLoad = async ({ cookies, url }) => {
	const token = cookies.get('auth-session');
	const { user } = await validateSessionToken(token || '');
	if (!user) throw redirect(303, '/auth/login');
	
	// Get pagination and filter params
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 20;
	const offset = (page - 1) * limit;
	const moodFilter = url.searchParams.get('mood') || 'all';
	const searchQuery = url.searchParams.get('q') || '';
	
	try {
		// Build query conditions
		const conditions = [eq(table.entry.userId, user.id)];
		
		if (moodFilter !== 'all') {
			conditions.push(eq(table.entry.mood, moodFilter));
		}
		
		if (searchQuery.trim()) {
			conditions.push(like(table.entry.content, `%${searchQuery}%`));
		}
		
		// Get total count for pagination
		const countResult = await db
			.select()
			.from(table.entry)
			.where(and(...conditions));
		
		const totalEntries = countResult.length;
		const totalPages = Math.ceil(totalEntries / limit);
		
		// Get entries with pagination
		const rows = await db
			.select()
			.from(table.entry)
			.where(and(...conditions))
			.orderBy(desc(table.entry.createdAt))
			.limit(limit)
			.offset(offset);
		
		// Create excerpts for list view
		const entries = rows.map((entry) => {
			// Extract first 150 characters as excerpt
			const plainText = entry.content.replace(/[#*`\[\]()]/g, '').trim();
			const excerpt = plainText.length > 150 
				? plainText.substring(0, 150) + '...' 
				: plainText;
			
			return {
				id: entry.id,
				mood: entry.mood,
				excerpt,
				createdAt: entry.createdAt,
				updatedAt: entry.updatedAt
			};
		});
		
		return { 
			user, 
			entries,
			pagination: {
				page,
				totalPages,
				totalEntries
			},
			filters: {
				mood: moodFilter,
				search: searchQuery
			}
		};
	} catch (dbError) {
		console.error('[journal] Database error loading entries:', dbError);
		return { 
			user, 
			entries: [],
			pagination: {
				page: 1,
				totalPages: 0,
				totalEntries: 0
			},
			filters: {
				mood: 'all',
				search: ''
			}
		};
	}
};
