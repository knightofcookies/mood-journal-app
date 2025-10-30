<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let { data } = $props();

	function getMoodEmoji(mood: string) {
		const emojis: Record<string, string> = {
			happy: '😊',
			neutral: '😐',
			sad: '😢',
			anxious: '😰',
			excited: '🤩'
		};
		return emojis[mood] || '😐';
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
	let moodFilter = $state(data.filters.mood);

	function updateFilters() {
		const params = new URLSearchParams($page.url.searchParams);
		if (searchQuery) {
			params.set('q', searchQuery);
		} else {
			params.delete('q');
		}
		if (moodFilter !== 'all') {
			params.set('mood', moodFilter);
		} else {
			params.delete('mood');
		}
		params.delete('page'); // Reset to page 1 when filters change
		goto(`?${params.toString()}`);
	}

	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`?${params.toString()}`);
	}
</script>

<svelte:head>
	<title>Journal | Mood Journal</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="max-w-6xl mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-6">
				<div>
					<h1 class="text-3xl font-bold text-gray-900 dark:text-white">Journal</h1>
					<p class="text-gray-600 dark:text-gray-400 mt-2">
						{data.pagination.totalEntries} {data.pagination.totalEntries === 1 ? 'entry' : 'entries'}
					</p>
				</div>
				<div class="flex gap-3">
					<a
						href="/journal/analytics"
						class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
					>
						<span>📊</span>
						<span class="hidden sm:inline">Analytics</span>
					</a>
					<a
						href="/journal/search"
						class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
					>
						<span>🔍</span>
						<span class="hidden sm:inline">Search</span>
					</a>
					<a
						href="/journal/new"
						class="px-6 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors flex items-center gap-2"
					>
						<span>+</span>
						<span>New Entry</span>
					</a>
				</div>
			</div>

			<!-- Filters -->
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
				<div class="flex flex-col sm:flex-row gap-4">
					<!-- Search -->
					<div class="flex-1">
						<input
							type="text"
							bind:value={searchQuery}
							onkeydown={(e) => e.key === 'Enter' && updateFilters()}
							placeholder="Search entries..."
							class="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
						/>
					</div>

					<!-- Mood Filter -->
					<div class="flex gap-2">
						<button
							onclick={() => { moodFilter = 'all'; updateFilters(); }}
							class="px-4 py-2 rounded-lg border transition-all {moodFilter === 'all'
								? 'border-gray-900 dark:border-white bg-gray-900 dark:bg-white text-white dark:text-gray-900'
								: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'}"
						>
							All
						</button>
						{#each ['happy', 'neutral', 'sad', 'anxious', 'excited'] as mood}
							<button
								onclick={() => { moodFilter = mood; updateFilters(); }}
								class="px-3 py-2 rounded-lg border transition-all {moodFilter === mood
									? 'border-gray-900 dark:border-white bg-gray-50 dark:bg-gray-800'
									: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
								title={mood}
							>
								<span class="text-xl">{getMoodEmoji(mood)}</span>
							</button>
						{/each}
					</div>

					<button
						onclick={updateFilters}
						class="px-6 py-2 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors"
					>
						Apply
					</button>
				</div>
			</div>
		</div>

		<!-- Entries List -->
		{#if data.entries.length === 0}
			<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
				<div class="text-6xl mb-4">📔</div>
				<h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">No entries yet</h2>
				<p class="text-gray-600 dark:text-gray-400 mb-6">
					{data.filters.mood !== 'all' || data.filters.search
						? 'No entries match your filters. Try adjusting your search.'
						: 'Start your journaling journey by creating your first entry.'}
				</p>
				<a
					href="/journal/new"
					class="inline-block px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors"
				>
					Create First Entry
				</a>
			</div>
		{:else}
			<div class="space-y-4">
				{#each data.entries as entry (entry.id)}
					<a
						href="/journal/{entry.id}"
						class="block bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-all p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
					>
						<div class="flex gap-4">
							<!-- Mood Emoji -->
							<div class="flex-shrink-0">
								<span class="text-4xl">{getMoodEmoji(entry.mood)}</span>
							</div>

							<!-- Content -->
							<div class="flex-1 min-w-0">
								<div class="flex items-start justify-between gap-4 mb-2">
									<h2 class="text-lg font-semibold text-gray-900 dark:text-white capitalize">
										{entry.mood}
									</h2>
									<span class="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
										{formatRelativeTime(entry.createdAt)}
									</span>
								</div>
								<p class="text-gray-700 dark:text-gray-300 line-clamp-3">
									{entry.excerpt}
								</p>
							</div>

							<!-- Arrow -->
							<div class="flex-shrink-0 self-center">
								<svg class="w-6 h-6 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
								</svg>
							</div>
						</div>
					</a>
				{/each}
			</div>

			<!-- Pagination -->
			{#if data.pagination.totalPages > 1}
				<div class="mt-8 flex justify-center items-center gap-2">
					<button
						onclick={() => goToPage(data.pagination.page - 1)}
						disabled={data.pagination.page === 1}
						class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						← Previous
					</button>

					<span class="px-4 py-2 text-gray-700 dark:text-gray-300">
						Page {data.pagination.page} of {data.pagination.totalPages}
					</span>

					<button
						onclick={() => goToPage(data.pagination.page + 1)}
						disabled={data.pagination.page >= data.pagination.totalPages}
						class="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						Next →
					</button>
				</div>
			{/if}
		{/if}
	</div>
</div>
