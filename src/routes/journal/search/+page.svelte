<script lang="ts">
	import type { PageData } from './$types';
	import { marked } from 'marked';
	import { safeHtml } from '$lib/actions/safeHtml';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');
	let selectedTags = $state<string[]>([]);
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
		sentimentFilter = 'all';
	}

	function highlightText(text: string, query: string): string {
		if (!query) return text;
		const words = query
			.toLowerCase()
			.split(/\s+/)
			.filter((w) => w.length > 2);
		let highlighted = text;

		for (const word of words) {
			const regex = new RegExp(`(${word})`, 'gi');
			highlighted = highlighted.replace(
				regex,
				'<mark class="bg-yellow-200 dark:bg-yellow-600">$1</mark>'
			);
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
			(sentimentFilter !== 'all' ? 1 : 0) +
			(searchQuery.length > 0 ? 1 : 0)
	);
</script>

<svelte:head>
	<title>Search Journal - Mood Journal</title>
</svelte:head>

<div class="mx-auto max-w-6xl space-y-6 p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-3xl font-bold text-foreground">🔍 Search Your Journal</h1>
		<p class="text-muted-foreground">
			Find entries by keywords, sentiment, or tags
		</p>
	</div>

	<!-- Search Box -->
	<div class="rounded-lg bg-card border p-6 shadow">
		<div class="relative">
			<input
				type="text"
				bind:value={searchQuery}
				placeholder="Search your journal... (e.g., 'work stress', 'weekend fun', 'family dinner')"
				class="w-full rounded-lg border bg-background px-4 py-3 pr-4 pl-12 text-lg text-foreground focus:border-transparent focus:ring-2 focus:ring-ring"
			/>
			<svg
				class="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-muted-foreground"
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
	<div class="space-y-4 rounded-lg bg-card border p-6 shadow">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold text-foreground">Filters</h3>
			{#if activeFilterCount > 0}
				<button
					onclick={clearFilters}
					class="text-sm text-primary hover:text-primary/80"
				>
					Clear all ({activeFilterCount})
				</button>
			{/if}
		</div>

		<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
			<!-- Sentiment Filter -->
			<div>
				<label
					for="sentiment-select"
					class="mb-2 block text-sm font-medium text-foreground"
				>
					Sentiment
				</label>
				<select
					id="sentiment-select"
					bind:value={sentimentFilter}
					class="w-full rounded-lg border bg-background px-3 py-2 text-foreground"
				>
					<option value="all">All Sentiments</option>
					<option value="positive">Positive</option>
					<option value="neutral">Neutral</option>
					<option value="negative">Negative</option>
				</select>
			</div>

			<!-- Date Order -->
			<div>
				<label
					for="date-select"
					class="mb-2 block text-sm font-medium text-foreground"
				>
					Sort By Date
				</label>
				<select
					id="date-select"
					bind:value={dateOrder}
					class="w-full rounded-lg border bg-background px-3 py-2 text-foreground"
				>
					<option value="desc">Newest First</option>
					<option value="asc">Oldest First</option>
				</select>
			</div>
		</div>

		<!-- Tag Filter -->
		{#if data.tags.length > 0}
			<div>
				<h3 class="mb-2 block text-sm font-medium text-foreground">
					Filter by Tags
				</h3>
				<div class="flex flex-wrap gap-2">
					{#each data.tags.slice(0, 20) as tag}
						<button
							onclick={() => toggleTag(tag.name)}
							class="rounded-full px-3 py-1 text-sm transition-colors {selectedTags.includes(
								tag.name
							)
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
							type="button"
						>
							{tag.type === 'keyword' ? '🔑' : '🏷️'}
							{tag.name}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>

	<!-- Results -->
	<div class="rounded-lg bg-card border p-6 shadow">
		<div class="mb-4 flex items-center justify-between">
			<h3 class="text-lg font-semibold text-foreground">
				Results ({filteredEntries.length})
			</h3>
		</div>

		{#if filteredEntries.length === 0}
			<div class="py-12 text-center">
				<div class="mb-4 text-6xl">🔍</div>
				<p class="text-lg text-muted-foreground">
					{searchQuery || activeFilterCount > 0
						? 'No entries match your search'
						: 'Start searching your journal'}
				</p>
			</div>
		{:else}
			<div class="space-y-4">
				{#each filteredEntries as entry}
					<div
						class="rounded-lg border p-4 transition-shadow hover:shadow-md"
					>
						<div class="mb-2 flex items-start justify-between">
							<div class="flex items-center gap-3">
								<div>
									<div class="font-medium text-foreground">
										{formatDate(entry.createdAt)}
									</div>
									<div class="flex items-center gap-2 text-sm text-muted-foreground">
										{#if entry.sentimentScore !== null}
											<span>
												{getSentimentEmoji(entry.sentimentScore)}
												{entry.sentimentScore > 0 ? '+' : ''}{entry.sentimentScore}
											</span>
										{/if}
									</div>
								</div>
							</div>
						</div>
						<div class="prose mt-3 max-w-none dark:prose-invert">
							<div class="line-clamp-3 text-foreground" use:safeHtml={highlightText(
								entry.content.substring(0, 300) + (entry.content.length > 300 ? '...' : ''),
								searchQuery
							)}>
							</div>
						</div>
						<div class="mt-3">
							<a
								href="/journal#{entry.id}"
								class="text-sm font-medium text-primary hover:text-primary/80"
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
			class="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
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
		line-clamp: 3;
		overflow: hidden;
	}
</style>
