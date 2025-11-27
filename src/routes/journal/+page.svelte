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

<!-- Modern Premium Journal Page -->
<PullToRefresh onRefresh={handleRefresh}>
	<div class="bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
		<div class="mx-auto max-w-5xl px-6 sm:px-8 py-10">
			<!-- Page Title (Modern Premium style) -->
			<div class="mb-10 fade-in">
				<div class="flex items-center gap-4 mb-4">
					<div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-2xl shadow-lg floating">
						📝
					</div>
					<div>
						<h1 class="text-5xl font-black gradient-text">Journal</h1>
						<div class="text-muted-foreground flex items-center gap-3 text-sm mt-2">
							<span class="flex items-center gap-2">
								<div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
								<strong class="font-semibold text-foreground">{data.pagination.totalEntries}</strong>
								{data.pagination.totalEntries === 1 ? 'entry' : 'entries'}
							</span>
							<span class="text-border">•</span>
							<a href="/journal/new" class="notion-btn-primary text-sm shadow-lg hover:shadow-xl group inline-flex items-center gap-2">
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
								</svg>
								New Entry
							</a>
						</div>
					</div>
				</div>
			</div>

			<!-- Search & Filters (Modern Premium style) -->
			<div class="mb-8 space-y-4 fade-in" style="animation-delay: 100ms">
				<!-- Search Bar with glass effect -->
				<div
					class="glass-card flex items-center gap-3 rounded-2xl px-5 py-4 shadow-lg focus-within:ring-2 focus-within:ring-primary/50 transition-all group"
				>
					<svg
						class="text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary"
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
						placeholder="Search your entries... (Press Enter)"
						class="notion-input text-base flex-1"
					/>
					{#if searchQuery}
						<button
							onclick={() => {
								searchQuery = '';
								updateFilters();
							}}
							aria-label="Clear search"
							class="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-accent rounded-lg"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					{/if}
				</div>

				<!-- Tag Filters with enhanced styling -->
				{#if data.topTags.length > 0}
					<div class="flex flex-wrap items-center gap-3">
						<span class="text-muted-foreground text-sm font-semibold flex items-center gap-2">
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
							</svg>
							Tags:
						</span>
						{#each data.topTags.slice(0, 8) as tag, index}
							<button
								onclick={() => {
									tagFilter = tag.name;
									updateFilters();
								}}
								class="notion-btn text-sm scale-in {tagFilter === tag.name ? 'notion-btn-primary shadow-md' : 'hover:border-primary/30'}"
								style="animation-delay: {index * 50}ms"
							>
								{tag.name}
								<span class="text-xs opacity-70">({tag.count})</span>
							</button>
						{/each}
						{#if tagFilter}
							<button
								onclick={() => {
									tagFilter = '';
									updateFilters();
								}}
								class="text-destructive hover:text-destructive/80 text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-destructive/10 transition-all"
							>
								<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
								Clear Filter
							</button>
						{/if}
					</div>
				{/if}
			</div>

			<!-- Entries List (Modern Premium style) -->
			{#if data.entries.length === 0}
				<div class="mt-20 text-center fade-in">
					<div class="mb-6 text-8xl opacity-30 floating">📔</div>
					<h2 class="mb-3 text-3xl font-bold">No entries found</h2>
					<p class="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
						{data.filters.search || tagFilter
							? 'No entries match your filters. Try adjusting your search.'
							: 'Start your journaling journey by creating your first entry.'}
					</p>
					<a href="/journal/new" class="notion-btn-primary shadow-xl hover:shadow-2xl group inline-flex items-center gap-2">
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
						</svg>
						Create First Entry
					</a>
				</div>
			{:else}
				<div class="space-y-4">
					{#each data.entries as entry, index (entry.id)}
						<a href="/journal/{entry.id}" class="notion-card group block p-6 fade-in" style="animation-delay: {index * 50}ms">
							<div class="flex items-start gap-4">
								<!-- Mood Emoji with gradient background -->
								<div class="flex-shrink-0">
									<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl shadow-md group-hover:shadow-lg transition-all group-hover:scale-110 group-hover:rotate-3">
										{entry.sentimentScore !== null ? getSentimentEmoji(entry.sentimentScore) : '😐'}
									</div>
								</div>

								<!-- Content -->
								<div class="min-w-0 flex-1">
									<div class="mb-2 flex items-center gap-3 flex-wrap">
										<h3 class="font-bold text-lg group-hover:text-primary transition-colors">
											{#if entry.sentimentScore !== null}
												{#if entry.sentimentScore > 50}
													Positive Day
												{:else if entry.sentimentScore > 0}
													Good Mood
												{:else if entry.sentimentScore === 0}
													Neutral Entry
												{:else if entry.sentimentScore > -50}
													Reflective
												{:else}
													Challenging Day
												{/if}
											{:else}
												Journal Entry
											{/if}
										</h3>
										{#if entry.sentimentScore !== null}
											<span class="px-3 py-1 rounded-full text-xs font-semibold {entry.sentimentScore > 0 ? 'bg-green-500/20 text-green-700 dark:text-green-400' : entry.sentimentScore < 0 ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400' : 'bg-gray-500/20 text-gray-700 dark:text-gray-400'}">
												{entry.sentimentScore > 0 ? '+' : ''}{entry.sentimentScore}
											</span>
										{/if}
										<span class="text-muted-foreground text-sm flex items-center gap-1.5">
											<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											{formatRelativeTime(entry.createdAt)}
										</span>
									</div>

									<p class="text-foreground/80 line-clamp-2 text-base leading-relaxed mb-3">
										{entry.excerpt}
									</p>

									<!-- Tags with modern badges -->
									{#if entry.tags && entry.tags.length > 0}
										<div class="flex flex-wrap gap-2">
											{#each entry.tags.slice(0, 5) as tag}
												<span
													class="bg-accent/80 text-foreground inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-medium border border-border/50 hover:border-primary/50 transition-all"
												>
													{#if tag.type === 'entity'}
														<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
															<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
														</svg>
													{:else}
														<span class="w-1.5 h-1.5 rounded-full bg-primary"></span>
													{/if}
													{tag.name}
												</span>
											{/each}
											{#if entry.tags.length > 5}
												<span class="text-muted-foreground text-xs flex items-center px-2">
													+{entry.tags.length - 5} more
												</span>
											{/if}
										</div>
									{/if}
								</div>

								<!-- Arrow Icon with animation -->
								<svg
									class="text-muted-foreground mt-2 h-5 w-5 flex-shrink-0 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
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

				<!-- Pagination with modern styling -->
				{#if data.pagination.totalPages > 1}
					<div class="mt-12 flex items-center justify-center gap-3 fade-in">
						<button
							onclick={() => goToPage(data.pagination.page - 1)}
							disabled={data.pagination.page === 1}
							class="notion-btn disabled:cursor-not-allowed disabled:opacity-30 shadow-md hover:shadow-lg disabled:hover:shadow-none group"
						>
							<svg class="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
							Previous
						</button>

						<div class="flex items-center gap-2">
							{#each Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
								const pageNum = data.pagination.page > 3 ? data.pagination.page - 2 + i : i + 1;
								return pageNum <= data.pagination.totalPages ? pageNum : null;
							}).filter(Boolean) as pageNum}
								{#if pageNum !== null}
									<button
										onclick={() => goToPage(pageNum)}
										class="w-10 h-10 rounded-lg font-semibold transition-all {data.pagination.page === pageNum ? 'bg-primary text-primary-foreground shadow-lg' : 'hover:bg-accent'}"
									>
										{pageNum}
									</button>
								{/if}
							{/each}
						</div>

						<button
							onclick={() => goToPage(data.pagination.page + 1)}
							disabled={data.pagination.page === data.pagination.totalPages}
							class="notion-btn disabled:cursor-not-allowed disabled:opacity-30 shadow-md hover:shadow-lg disabled:hover:shadow-none group"
						>
							Next
							<svg class="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</PullToRefresh>
