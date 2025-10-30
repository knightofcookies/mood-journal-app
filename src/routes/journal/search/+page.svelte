<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedTags = $state<string[]>([]);
	let selectedMood = $state('all');
	let sentimentFilter = $state<'all' | 'positive' | 'neutral' | 'negative'>('all');
	let dateOrder = $state<'desc' | 'asc'>('desc');

	// Semantic search function
	function calculateRelevance(entry: any, query: string, tags: string[]): number {
		if (!query && tags.length === 0) return 1;

		let score = 0;
		const lowerQuery = query.toLowerCase();
		const lowerContent = entry.content.toLowerCase();

		// Exact phrase match (highest weight)
		if (lowerContent.includes(lowerQuery)) {
			score += 10;
		}

		// Word matching (medium weight)
		const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 2);
		for (const word of queryWords) {
			if (lowerContent.includes(word)) {
				score += 5;
			}
		}

		// Tag matching (high weight)
		// Note: We'd need to fetch entry tags, but for now we'll use content matching
		for (const tag of tags) {
			if (lowerContent.includes(tag.toLowerCase())) {
				score += 8;
			}
		}

		// Sentiment alignment
		if (query.includes('happy') || query.includes('joy')) {
			if (entry.sentimentScore && entry.sentimentScore > 50) score += 3;
		}
		if (query.includes('sad') || query.includes('upset')) {
			if (entry.sentimentScore && entry.sentimentScore < -30) score += 3;
		}

		return score;
	}

	const filteredEntries = $derived.by(() => {
		let results = data.entries;

		// Mood filter
		if (selectedMood !== 'all') {
			results = results.filter((e) => e.mood === selectedMood);
		}

		// Sentiment filter
		if (sentimentFilter === 'positive') {
			results = results.filter((e) => (e.sentimentScore ?? 0) > 0);
		} else if (sentimentFilter === 'negative') {
			results = results.filter((e) => (e.sentimentScore ?? 0) < 0);
		} else if (sentimentFilter === 'neutral') {
			results = results.filter((e) => (e.sentimentScore ?? 0) === 0);
		}

		// Search and tag filtering
		if (searchQuery || selectedTags.length > 0) {
			results = results
				.map((entry) => ({
					...entry,
					relevance: calculateRelevance(entry, searchQuery, selectedTags)
				}))
				.filter((entry) => entry.relevance > 0)
				.sort((a, b) => b.relevance - a.relevance);
		} else {
			// Date sorting when no search
			results = [...results].sort((a, b) => {
				const aTime = new Date(a.createdAt).getTime();
				const bTime = new Date(b.createdAt).getTime();
				return dateOrder === 'desc' ? bTime - aTime : aTime - bTime;
			});
		}

		return results;
	});

	function toggleTag(tagName: string) {
		if (selectedTags.includes(tagName)) {
			selectedTags = selectedTags.filter((t) => t !== tagName);
		} else {
			selectedTags = [...selectedTags, tagName];
		}
	}

	function clearFilters() {
		searchQuery = '';
		selectedTags = [];
		selectedMood = 'all';
		sentimentFilter = 'all';
	}

	function highlightText(text: string, query: string): string {
		if (!query) return text;
		const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
		let highlighted = text;

		for (const word of words) {
			const regex = new RegExp(`(${word})`, 'gi');
			highlighted = highlighted.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>');
		}

		return highlighted;
	}

	function getSentimentEmoji(score: number | null): string {
		if (score === null) return '😐';
		if (score > 50) return '😊';
		if (score > 0) return '🙂';
		if (score === 0) return '😐';
		if (score > -50) return '😟';
		return '😢';
	}

	function formatDate(date: Date | string): string {
		return new Date(date).toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	const activeFilterCount = $derived(
		(selectedTags.length > 0 ? 1 : 0) +
			(selectedMood !== 'all' ? 1 : 0) +
			(sentimentFilter !== 'all' ? 1 : 0) +
			(searchQuery.length > 0 ? 1 : 0)
	);
</script>

<svelte:head>
	<title>Search Journal - Mood Journal</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6 space-y-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">🔍 Search Your Journal</h1>
		<p class="text-gray-600 dark:text-gray-400">
			Find entries by keywords, mood, sentiment, or tags
		</p>
	</div>

	<!-- Search Box -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
		<div class="relative">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search your journal... (e.g., 'work stress', 'weekend fun', 'family dinner')"
				class="w-full px-4 py-3 pl-12 pr-4 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/>
			<svg
				class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				/>
			</svg>
		</div>
	</div>

	<!-- Filters -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
			{#if activeFilterCount > 0}
				<button
					onclick={clearFilters}
					class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
				>
					Clear all ({activeFilterCount})
				</button>
			{/if}
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
			<!-- Mood Filter -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Mood
				</label>
				<select
					bind:value={selectedMood}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				>
					<option value="all">All Moods</option>
					<option value="happy">😊 Happy</option>
					<option value="neutral">😐 Neutral</option>
					<option value="sad">😢 Sad</option>
					<option value="anxious">😰 Anxious</option>
					<option value="excited">🤩 Excited</option>
					<option value="calm">😌 Calm</option>
					<option value="stressed">😫 Stressed</option>
				</select>
			</div>

			<!-- Sentiment Filter -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Sentiment
				</label>
				<select
					bind:value={sentimentFilter}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				>
					<option value="all">All Sentiments</option>
					<option value="positive">Positive</option>
					<option value="neutral">Neutral</option>
					<option value="negative">Negative</option>
				</select>
			</div>

			<!-- Date Order -->
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Sort By Date
				</label>
				<select
					bind:value={dateOrder}
					class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
				>
					<option value="desc">Newest First</option>
					<option value="asc">Oldest First</option>
				</select>
			</div>
		</div>

		<!-- Tag Filter -->
		{#if data.tags.length > 0}
			<div>
				<label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
					Filter by Tags
				</label>
				<div class="flex flex-wrap gap-2">
					{#each data.tags.slice(0, 20) as tag}
						<button
							onclick={() => toggleTag(tag.name)}
							class="px-3 py-1 rounded-full text-sm transition-colors {selectedTags.includes(
								tag.name
							)
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}"
							type="button"
						>
							{tag.type === 'keyword' ? '🔑' : '🏷️'} {tag.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Results -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
		<div class="flex items-center justify-between mb-4">
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
				Results ({filteredEntries.length})
			</h3>
		</div>

		{#if filteredEntries.length === 0}
			<div class="text-center py-12">
				<div class="text-6xl mb-4">🔍</div>
				<p class="text-gray-600 dark:text-gray-400 text-lg">
					{searchQuery || activeFilterCount > 0
						? 'No entries match your search'
						: 'Start searching your journal'}
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each filteredEntries as entry}
					<div
						class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
					>
						<div class="flex items-start justify-between mb-2">
							<div class="flex items-center gap-3">
								<span class="text-2xl">{entry.mood === 'happy' ? '😊' : entry.mood === 'sad' ? '😢' : entry.mood === 'anxious' ? '😰' : '😐'}</span>
								<div>
									<div class="font-medium text-gray-900 dark:text-white">
										{formatDate(entry.createdAt)}
									</div>
									<div class="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
										<span class="capitalize">{entry.mood}</span>
										{#if entry.sentimentScore !== null}
											<span>•</span>
											<span>
												{getSentimentEmoji(entry.sentimentScore)}
												{entry.sentimentScore > 0 ? '+' : ''}{entry.sentimentScore}
											</span>
										{/if}
									</div>
								</div>
							</div>
						</div>
						<div class="prose dark:prose-invert max-w-none mt-3">
							<div class="text-gray-700 dark:text-gray-300 line-clamp-3">
								{@html highlightText(
									entry.content.substring(0, 300) +
										(entry.content.length > 300 ? '...' : ''),
									searchQuery
								)}
							</div>
						</div>
						<div class="mt-3">
							<a
								href="/journal#{entry.id}"
								class="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
							>
								View full entry →
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Back Button -->
	<div>
		<a
			href="/journal"
			class="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
		>
			← Back to Journal
		</a>
	</div>
</div>

<style>
	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
