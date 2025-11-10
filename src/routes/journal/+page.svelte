<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PullToRefresh from '$lib/components/PullToRefresh.svelte';

	let { data } = $props();

	function getMoodEmoji(mood: string) {
		const emojis: Record<string, string> = {
			happy: '😊',
			neutral: '😐',
			sad: '😢',
			anxious: '😰',
			excited: '🤩',
			calm: '😌',
			stressed: '😫',
			angry: '😠',
			other: '🤔'
		};
		return emojis[mood] || '😐';
	}

	function getSentimentEmoji(score: number): string {
		if (score > 50) return '😊';
		if (score > 0) return '🙂';
		if (score === 0) return '😐';
		if (score > -50) return '😟';
		return '😢';
	}

	function formatRelativeTime(date: Date | string) {
		const now = new Date();
		const entryDate = new Date(date);
		const diffMs = now.getTime() - entryDate.getTime();
		const diffMinutes = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
		const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

		if (diffMinutes < 1) return 'Just now';
		if (diffMinutes < 60) return `${diffMinutes}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;

		return entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	let searchQuery = $state(data.filters.search);
	let tagFilter = $state(data.filters.tag);

	function updateFilters() {
		const params = new URLSearchParams($page.url.searchParams);
		if (searchQuery) {
			params.set('q', searchQuery);
		} else {
			params.delete('q');
		}
		if (tagFilter) {
			params.set('tag', tagFilter);
		} else {
			params.delete('tag');
		}
		params.delete('page');
		goto(`?${params.toString()}`);
	}

	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`?${params.toString()}`);
	}

	async function handleRefresh() {
		await goto($page.url.pathname + $page.url.search, { invalidateAll: true });
	}
</script>

<svelte:head>
	<title>Journal | Mood Journal</title>
</svelte:head>

<!-- Notion-like Journal Page -->
<PullToRefresh onRefresh={handleRefresh}>
	<div class="bg-background h-full">
		<div class="mx-auto max-w-4xl px-8 py-8">
			<!-- Page Title (Notion-style) -->
			<div class="mb-8">
				<h1 class="mb-2 text-5xl font-bold">📝 Journal</h1>
				<div class="text-muted-foreground flex items-center gap-4 text-sm">
					<span
						>{data.pagination.totalEntries}
						{data.pagination.totalEntries === 1 ? 'entry' : 'entries'}</span
					>
					<span>•</span>
					<a href="/journal/new" class="notion-btn notion-btn-primary text-sm"> + New Entry </a>
				</div>
			</div>

			<!-- Search & Filters (Notion-style) -->
			<div class="mb-6 space-y-3">
				<!-- Search Bar -->
				<div
					class="border-border bg-card focus-within:border-foreground/30 flex items-center gap-2 rounded-lg border px-4 py-2 transition-all"
				>
					<svg
						class="text-muted-foreground h-4 w-4"
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
					<input
						type="text"
						bind:value={searchQuery}
						onkeydown={(e) => e.key === 'Enter' && updateFilters()}
						placeholder="Search your entries..."
						class="notion-input text-sm"
					/>
				</div>

				<!-- Tag Filters -->
				{#if data.topTags.length > 0}
					<div class="flex flex-wrap items-center gap-2">
						<span class="text-muted-foreground text-xs font-medium">Tags:</span>
						{#each data.topTags.slice(0, 8) as tag}
							<button
								onclick={() => {
									tagFilter = tag.name;
									updateFilters();
								}}
								class="notion-btn text-xs {tagFilter === tag.name ? 'bg-accent' : ''}"
							>
								{tag.name} <span class="text-muted-foreground">({tag.count})</span>
							</button>
						{/each}
						{#if tagFilter}
							<button
								onclick={() => {
									tagFilter = '';
									updateFilters();
								}}
								class="text-muted-foreground hover:text-foreground text-xs"
							>
								Clear
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Entries List (Notion-style) -->
			{#if data.entries.length === 0}
				<div class="mt-16 text-center">
					<div class="mb-4 text-6xl opacity-50">📔</div>
					<h2 class="mb-2 text-2xl font-semibold">No entries found</h2>
					<p class="text-muted-foreground mb-6">
						{data.filters.search || tagFilter
							? 'No entries match your filters. Try adjusting your search.'
							: 'Start your journaling journey by creating your first entry.'}
					</p>
					<a href="/journal/new" class="notion-btn notion-btn-primary"> Create First Entry </a>
				</div>
			{:else}
				<div class="space-y-2">
					{#each data.entries as entry (entry.id)}
						<a href="/journal/{entry.id}" class="notion-card group block p-4">
							<div class="flex items-start gap-3">
								<!-- Mood Emoji -->
								<div class="mt-0.5 text-2xl">
									{getSentimentEmoji(entry.sentimentScore)}
								</div>

								<!-- Content -->
								<div class="min-w-0 flex-1">
									<div class="mb-1 flex items-center gap-3">
										<h3 class="font-medium capitalize">Sentiment Score: {entry.sentimentScore}</h3>
										<span class="text-muted-foreground text-xs">
											{formatRelativeTime(entry.createdAt)}
										</span>
										{#if entry.sentimentScore !== null && entry.sentimentScore !== undefined}
											<span
												class="text-base"
												title="Sentiment: {entry.sentimentLabel} ({entry.sentimentScore > 0
													? '+'
													: ''}{entry.sentimentScore})"
											>
												<!-- {getSentimentEmoji(entry.sentimentScore)} -->
											</span>
										{/if}
									</div>

									<p class="text-muted-foreground line-clamp-2 text-sm">
										{entry.excerpt}
									</p>

									<!-- Tags -->
									{#if entry.tags && entry.tags.length > 0}
										<div class="mt-2 flex flex-wrap gap-1">
											{#each entry.tags.slice(0, 5) as tag}
												<span
													class="bg-accent text-foreground inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs"
												>
													{#if tag.type === 'entity'}
														<span>👤</span>
													{/if}
													{tag.name}
												</span>
											{/each}
											{#if entry.tags.length > 5}
												<span class="text-muted-foreground text-xs">
													+{entry.tags.length - 5}
												</span>
											{/if}
										</div>
									{/if}
								</div>

								<!-- Arrow Icon -->
								<svg
									class="text-muted-foreground mt-1 h-4 w-4 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 5l7 7-7 7"
									/>
								</svg>
							</div>
						</a>
					{/each}
				</div>

				<!-- Pagination -->
				{#if data.pagination.totalPages > 1}
					<div class="mt-8 flex items-center justify-center gap-2">
						<button
							onclick={() => goToPage(data.pagination.page - 1)}
							disabled={data.pagination.page === 1}
							class="notion-btn disabled:cursor-not-allowed disabled:opacity-50"
						>
							← Previous
						</button>

						<span class="text-muted-foreground px-4 py-2 text-sm">
							Page {data.pagination.page} of {data.pagination.totalPages}
						</span>

						<button
							onclick={() => goToPage(data.pagination.page + 1)}
							disabled={data.pagination.page === data.pagination.totalPages}
							class="notion-btn disabled:cursor-not-allowed disabled:opacity-50"
						>
							Next →
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</PullToRefresh>
