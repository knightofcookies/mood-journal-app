<script lang="ts">
	import type { PageData } from './$types';
	import MoodTrendsChart from '$lib/components/charts/MoodTrendsChart.svelte';

	let { data }: { data: PageData } = $props();

	let timeRange = $state<'daily' | 'weekly' | 'monthly'>('daily');
	let chartType = $state<'line' | 'bar'>('line');

	const stats = data.statistics;

	function getSentimentEmoji(score: number): string {
		if (score > 50) return '😊';
		if (score > 0) return '🙂';
		if (score === 0) return '😐';
		if (score > -50) return '😟';
		return '😢';
	}

	function getSentimentColor(score: number): string {
		if (score > 50) return 'text-green-600';
		if (score > 0) return 'text-green-400';
		if (score === 0) return 'text-gray-600';
		if (score > -50) return 'text-orange-500';
		return 'text-red-600';
	}
</script>

<svelte:head>
	<title>Analytics & Insights - Mood Journal</title>
</svelte:head>

<div class="max-w-6xl mx-auto p-6 space-y-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics & Insights</h1>
		<p class="text-gray-600 dark:text-gray-400">
			Understand your emotional patterns and track your wellness journey
		</p>
	</div>

	<!-- Statistics Cards -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
		<!-- Total Entries -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Total Entries</h3>
				<span class="text-2xl">📝</span>
			</div>
			<p class="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalEntries}</p>
			<p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
				{stats.entriesLast30Days} in last 30 days
			</p>
		</div>

		<!-- Average Sentiment -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Sentiment</h3>
				<span class="text-2xl">{getSentimentEmoji(stats.avgSentiment)}</span>
			</div>
			<p class="text-3xl font-bold {getSentimentColor(stats.avgSentiment)}">
				{stats.avgSentiment > 0 ? '+' : ''}{stats.avgSentiment}
			</p>
			<p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
				{stats.avgSentiment > 50
					? 'Very positive'
					: stats.avgSentiment > 0
						? 'Positive'
						: stats.avgSentiment === 0
							? 'Neutral'
							: stats.avgSentiment > -50
								? 'Negative'
								: 'Very negative'}
			</p>
		</div>

		<!-- Current Streak -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Current Streak</h3>
				<span class="text-2xl">🔥</span>
			</div>
			<p class="text-3xl font-bold text-orange-600">{stats.activeStreak}</p>
			<p class="text-xs text-gray-500 dark:text-gray-500 mt-1">
				{stats.activeStreak === 1 ? 'day' : 'days'} in a row
			</p>
		</div>

		<!-- Longest Streak -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<div class="flex items-center justify-between mb-2">
				<h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">Best Streak</h3>
				<span class="text-2xl">🏆</span>
			</div>
			<p class="text-3xl font-bold text-purple-600">{stats.longestStreak}</p>
			<p class="text-xs text-gray-500 dark:text-gray-500 mt-1">Personal record</p>
		</div>
	</div>

	<!-- Mood Trends Chart -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
		<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white">Mood Trends Over Time</h2>

			<div class="flex gap-2 flex-wrap">
				<!-- Time Range Selector -->
				<div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
					<button
						onclick={() => (timeRange = 'daily')}
						class="px-3 py-1 rounded text-sm font-medium transition-colors {timeRange === 'daily'
							? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
					>
						Daily
					</button>
					<button
						onclick={() => (timeRange = 'weekly')}
						class="px-3 py-1 rounded text-sm font-medium transition-colors {timeRange === 'weekly'
							? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
					>
						Weekly
					</button>
					<button
						onclick={() => (timeRange = 'monthly')}
						class="px-3 py-1 rounded text-sm font-medium transition-colors {timeRange === 'monthly'
							? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
					>
						Monthly
					</button>
				</div>

				<!-- Chart Type Selector -->
				<div class="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
					<button
						onclick={() => (chartType = 'line')}
						class="px-3 py-1 rounded text-sm font-medium transition-colors {chartType === 'line'
							? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
					>
						Line
					</button>
					<button
						onclick={() => (chartType = 'bar')}
						class="px-3 py-1 rounded text-sm font-medium transition-colors {chartType === 'bar'
							? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}"
					>
						Bar
					</button>
				</div>
			</div>
		</div>

		<MoodTrendsChart data={data.chartData} {timeRange} {chartType} />
	</div>

	<!-- Mood & Sentiment Distribution -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Mood Distribution -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Mood Distribution</h2>
			<div class="space-y-3">
				{#each Object.entries(stats.moodCounts).sort((a, b) => b[1] - a[1]) as [mood, count]}
					{@const percentage = ((count / stats.totalEntries) * 100).toFixed(1)}
					<div>
						<div class="flex justify-between items-center mb-1">
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
								{mood}
							</span>
							<span class="text-sm text-gray-500 dark:text-gray-400">
								{count} ({percentage}%)
							</span>
						</div>
						<div class="w-full bg-secondary rounded-full h-2">
							<div
								class="bg-primary h-2 rounded-full transition-all"
								style="width: {percentage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Sentiment Distribution -->
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
			<h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Sentiment Analysis</h2>
			<div class="space-y-3">
				{#each Object.entries(stats.sentimentCounts).sort((a, b) => b[1] - a[1]) as [sentiment, count]}
					{@const percentage = ((count / stats.totalEntries) * 100).toFixed(1)}
					{@const color =
						sentiment === 'POSITIVE'
							? 'bg-foreground/90'
							: sentiment === 'NEGATIVE'
								? 'bg-muted-foreground'
								: 'bg-muted-foreground/50'}
					<div>
						<div class="flex justify-between items-center mb-1">
							<span class="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
								{sentiment.toLowerCase()}
								{sentiment === 'POSITIVE' ? '😊' : sentiment === 'NEGATIVE' ? '😢' : '😐'}
							</span>
							<span class="text-sm text-gray-500 dark:text-gray-400">
								{count} ({percentage}%)
							</span>
						</div>
						<div class="w-full bg-secondary rounded-full h-2">
							<div class="{color} h-2 rounded-full transition-all" style="width: {percentage}%"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Insights Section -->
	<div class="bg-muted/50 rounded-lg shadow p-6">
		<h2 class="text-xl font-bold mb-4">💡 Personalized Insights</h2>
		<div class="space-y-3">
			{#if stats.activeStreak >= 7}
				<div class="flex items-start gap-3">
					<span class="text-2xl">🎉</span>
					<div>
						<p class="font-medium text-gray-900 dark:text-white">Amazing streak!</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							You've been journaling consistently for {stats.activeStreak} days. Keep up the great
							work!
						</p>
					</div>
				</div>
			{/if}

			{#if stats.avgSentiment > 50}
				<div class="flex items-start gap-3">
					<span class="text-2xl">🌟</span>
					<div>
						<p class="font-medium text-gray-900 dark:text-white">Very positive outlook</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Your recent entries show a very positive sentiment. You're doing great!
						</p>
					</div>
				</div>
			{:else if stats.avgSentiment < -30}
				<div class="flex items-start gap-3">
					<span class="text-2xl">💙</span>
					<div>
						<p class="font-medium text-gray-900 dark:text-white">We notice tough times</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							Your entries suggest you might be going through a challenging period. Remember,
							it's okay to seek support.
						</p>
					</div>
				</div>
			{/if}

			{#if stats.entriesLast30Days > 20}
				<div class="flex items-start gap-3">
					<span class="text-2xl">📈</span>
					<div>
						<p class="font-medium text-gray-900 dark:text-white">Highly engaged</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							You've journaled {stats.entriesLast30Days} times in the last month. Self-reflection is
							a powerful habit!
						</p>
					</div>
				</div>
			{/if}

			{#if stats.totalEntries < 5}
				<div class="flex items-start gap-3">
					<span class="text-2xl">🌱</span>
					<div>
						<p class="font-medium text-gray-900 dark:text-white">Just getting started</p>
						<p class="text-sm text-gray-600 dark:text-gray-400">
							You're building a great habit! Try to journal regularly to unlock deeper insights
							about your emotional patterns.
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Predictive Insights -->
	{#if data.insights}
		<div class="bg-muted/50 rounded-lg shadow p-6">
			<h2 class="text-xl font-bold mb-4">🔮 Predictive Insights</h2>
			
			{#if data.insights.forecast}
				<div class="mb-6 p-4 bg-background/50 rounded-lg">
					<div class="flex items-start gap-3">
						<span class="text-3xl">
							{data.insights.trendDirection === 'improving' ? '📈' : data.insights.trendDirection === 'declining' ? '📉' : '📊'}
						</span>
						<div>
							<p class="font-medium mb-1">Mood Trend</p>
							<p class="text-sm text-muted-foreground">{data.insights.forecast}</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Day of Week Patterns -->
			{#if Object.keys(data.insights.dayOfWeekPattern).length > 0}
				<div class="mb-6">
					<h3 class="font-semibold mb-3">📅 Day of Week Patterns</h3>
					<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
						{#each ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as day}
							{@const dayData = data.insights.dayOfWeekPattern[day]}
							{#if dayData}
								{@const sentiment = Math.round(dayData.avgSentiment)}
								{@const color = sentiment > 30 ? 'bg-accent border-border' : sentiment < -30 ? 'bg-muted border-border' : 'bg-secondary border-border'}
								<div class="p-3 rounded-lg {color} border text-center">
									<div class="text-xs font-medium mb-1">{day.slice(0, 3)}</div>
									<div class="text-lg font-bold">{sentiment > 0 ? '+' : ''}{sentiment}</div>
									<div class="text-xs text-muted-foreground">{dayData.count} entries</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<!-- Time of Day Patterns -->
			{#if Object.keys(data.insights.timeOfDayPattern).length > 0}
				<div class="mb-6">
					<h3 class="font-semibold mb-3">🕐 Time of Day Patterns</h3>
					<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
						{#each ['Morning', 'Afternoon', 'Evening', 'Night'] as time}
							{@const timeData = data.insights.timeOfDayPattern[time]}
							{#if timeData}
								{@const sentiment = Math.round(timeData.avgSentiment)}
								{@const emoji = time === 'Morning' ? '🌅' : time === 'Afternoon' ? '☀️' : time === 'Evening' ? '🌆' : '🌙'}
								{@const color = sentiment > 20 ? 'bg-accent border-border' : sentiment < -20 ? 'bg-muted border-border' : 'bg-secondary border-border'}
								<div class="p-4 rounded-lg border-2 {color}">
									<div class="flex items-center gap-2 mb-2">
										<span class="text-2xl">{emoji}</span>
										<span class="font-medium">{time}</span>
									</div>
									<div class="text-2xl font-bold">
										{sentiment > 0 ? '+' : ''}{sentiment}
									</div>
									<div class="text-xs text-muted-foreground mt-1">{timeData.count} entries</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<!-- Recommendations -->
			{#if data.insights.recommendations.length > 0}
				<div>
					<h3 class="font-semibold mb-3">💭 Recommendations</h3>
					<div class="space-y-2">
						{#each data.insights.recommendations as recommendation}
							<div class="flex items-start gap-2 p-3 bg-background/50 rounded-lg">
								<span class="text-lg">💡</span>
								<p class="text-sm text-muted-foreground">{recommendation}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="flex gap-4 justify-center">
		<a
			href="/journal"
			class="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
		>
			Write New Entry
		</a>
		<a
			href="/journal/export"
			class="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
		>
			Export Journal
		</a>
	</div>
</div>
