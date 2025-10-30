import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq, and, gte } from 'drizzle-orm';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { redirect } from '@sveltejs/kit';
import { discoverTopics } from '$lib/server/nlp';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (!user) throw redirect(303, '/auth/login');

	// Get date range from query params (default: last 30 days)
	const range = url.searchParams.get('range') || '30';
	const days = parseInt(range);
	const startDate = new Date();
	startDate.setDate(startDate.getDate() - days);

	// Fetch all entries for the user within the date range
	const entries = await db
		.select()
		.from(table.entry)
		.where(and(eq(table.entry.userId, user.id), gte(table.entry.createdAt, startDate)))
		.orderBy(table.entry.createdAt);

	// Fetch tags for correlation analysis
	const entryIds = entries.map((e) => e.id);
	const entryTags =
		entryIds.length > 0
			? await db
					.select({
						entryId: table.entryTag.entryId,
						tagName: table.tag.name,
						tagType: table.tag.type
					})
					.from(table.entryTag)
					.innerJoin(table.tag, eq(table.entryTag.tagId, table.tag.id))
			: [];

	// Group tags by entry
	const tagsByEntry = new Map<string, string[]>();
	entryTags.forEach(({ entryId, tagName }) => {
		if (!tagsByEntry.has(entryId)) {
			tagsByEntry.set(entryId, []);
		}
		tagsByEntry.get(entryId)!.push(tagName);
	});

	// Calculate statistics
	const stats = calculateStats(entries);
	const dailyData = aggregateByDay(entries);
	const moodDistribution = calculateMoodDistribution(entries);
	const tagCorrelation = calculateTagCorrelation(entries, tagsByEntry);

	// Discover topics from tags/keywords
	const entriesWithKeywords = entries.map((entry) => ({
		keywords: tagsByEntry.get(entry.id) || [],
		sentiment: entry.sentimentScore || 0
	}));
	const topics = discoverTopics(entriesWithKeywords);

	return {
		stats,
		dailyData,
		moodDistribution,
		tagCorrelation,
		topics,
		range: days,
		totalEntries: entries.length
	};
};

function calculateStats(entries: any[]) {
	if (entries.length === 0) {
		return {
			averageSentiment: 0,
			totalEntries: 0,
			positiveCount: 0,
			negativeCount: 0,
			neutralCount: 0,
			currentStreak: 0,
			longestStreak: 0
		};
	}

	const sentiments = entries
		.filter((e) => e.sentiment_score !== null)
		.map((e) => e.sentiment_score);

	const averageSentiment =
		sentiments.length > 0 ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0;

	const positiveCount = entries.filter((e) => (e.sentiment_score || 0) > 30).length;
	const negativeCount = entries.filter((e) => (e.sentiment_score || 0) < -30).length;
	const neutralCount = entries.length - positiveCount - negativeCount;

	// Calculate streaks (consecutive days with entries)
	const dates = entries.map((e) => new Date(e.createdAt).toDateString());
	const uniqueDates = [...new Set(dates)].sort();

	let currentStreak = 0;
	let longestStreak = 0;
	let tempStreak = 1;

	const today = new Date().toDateString();
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	// Check current streak
	if (uniqueDates.includes(today)) {
		currentStreak = 1;
		for (let i = 1; i < uniqueDates.length; i++) {
			const current = new Date(uniqueDates[uniqueDates.length - i]);
			const prev = new Date(uniqueDates[uniqueDates.length - i - 1]);
			const diffDays = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

			if (diffDays === 1) {
				currentStreak++;
			} else {
				break;
			}
		}
	}

	// Calculate longest streak
	for (let i = 1; i < uniqueDates.length; i++) {
		const current = new Date(uniqueDates[i]);
		const prev = new Date(uniqueDates[i - 1]);
		const diffDays = Math.floor((current.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

		if (diffDays === 1) {
			tempStreak++;
			longestStreak = Math.max(longestStreak, tempStreak);
		} else {
			tempStreak = 1;
		}
	}

	return {
		averageSentiment: Math.round(averageSentiment),
		totalEntries: entries.length,
		positiveCount,
		negativeCount,
		neutralCount,
		currentStreak,
		longestStreak: Math.max(longestStreak, currentStreak)
	};
}

function aggregateByDay(entries: any[]) {
	const dailyMap = new Map<string, { sum: number; count: number; moods: string[] }>();

	entries.forEach((entry) => {
		const date = new Date(entry.createdAt).toISOString().split('T')[0];
		const sentiment = entry.sentimentScore || 0;

		if (!dailyMap.has(date)) {
			dailyMap.set(date, { sum: 0, count: 0, moods: [] });
		}

		const day = dailyMap.get(date)!;
		day.sum += sentiment;
		day.count += 1;
		day.moods.push(entry.mood);
	});

	return Array.from(dailyMap.entries())
		.map(([date, data]) => ({
			date,
			averageSentiment: Math.round(data.sum / data.count),
			entryCount: data.count,
			moods: data.moods
		}))
		.sort((a, b) => a.date.localeCompare(b.date));
}

function calculateMoodDistribution(entries: any[]) {
	const moodCounts = new Map<string, number>();

	entries.forEach((entry) => {
		moodCounts.set(entry.mood, (moodCounts.get(entry.mood) || 0) + 1);
	});

	return Array.from(moodCounts.entries())
		.map(([mood, count]) => ({ mood, count }))
		.sort((a, b) => b.count - a.count);
}

function calculateTagCorrelation(entries: any[], tagsByEntry: Map<string, string[]>) {
	const tagSentiments = new Map<string, { sum: number; count: number }>();

	entries.forEach((entry) => {
		const tags = tagsByEntry.get(entry.id) || [];
		const sentiment = entry.sentimentScore || 0;

		tags.forEach((tag) => {
			if (!tagSentiments.has(tag)) {
				tagSentiments.set(tag, { sum: 0, count: 0 });
			}
			const data = tagSentiments.get(tag)!;
			data.sum += sentiment;
			data.count += 1;
		});
	});

	return Array.from(tagSentiments.entries())
		.map(([tag, data]) => ({
			tag,
			averageSentiment: Math.round(data.sum / data.count),
			count: data.count
		}))
		.filter((item) => item.count >= 2) // Only show tags that appear at least twice
		.sort((a, b) => b.count - a.count)
		.slice(0, 15); // Top 15 tags
}
