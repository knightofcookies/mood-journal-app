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

<div class="mx-auto max-w-7xl space-y-10 p-6 sm:p-8 bg-gradient-to-br from-background via-background to-accent/5 min-h-screen">
	<!-- Enhanced Header -->
	<div class="mb-10 fade-in">
		<div class="flex items-center gap-4 mb-4">
			<div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-3xl shadow-xl floating">
				📊
			</div>
			<div>
				<h1 class="text-5xl font-black gradient-text">Analytics & Insights</h1>
				<p class="text-muted-foreground text-lg mt-2">
					Understand your emotional patterns and track your wellness journey
				</p>
			</div>
		</div>
	</div>

	<!-- Enhanced Statistics Cards -->
	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
		<!-- Total Entries -->
		<div class="notion-card p-6 shadow-xl hover:shadow-2xl fade-in group" style="animation-delay: 0ms">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total Entries</h3>
				<div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
					📝
				</div>
			</div>
			<p class="text-4xl font-black text-foreground mb-2">{stats.totalEntries}</p>
			<div class="flex items-center gap-2 text-sm">
				<span class="px-2 py-1 rounded-full bg-green-500/20 text-green-700 dark:text-green-400 font-semibold">
					+{stats.entriesLast30Days}
				</span>
				<span class="text-muted-foreground">in last 30 days</span>
			</div>
		</div>

		<!-- Average Sentiment -->
		<div class="notion-card p-6 shadow-xl hover:shadow-2xl fade-in group" style="animation-delay: 100ms">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Avg Sentiment</h3>
				<div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
					{getSentimentEmoji(stats.avgSentiment)}
				</div>
			</div>
			<p class="text-4xl font-black {getSentimentColor(stats.avgSentiment)} mb-2">
				{stats.avgSentiment > 0 ? '+' : ''}{stats.avgSentiment}
			</p>
			<p class="text-sm text-muted-foreground font-medium">
				{stats.avgSentiment > 50
					? '🎉 Very positive'
					: stats.avgSentiment > 0
						? '😊 Positive'
						: stats.avgSentiment === 0
							? '😐 Neutral'
							: stats.avgSentiment > -50
								? '🤔 Negative'
								: '😔 Very negative'}
			</p>
		</div>

		<!-- Current Streak -->
		<div class="notion-card p-6 shadow-xl hover:shadow-2xl fade-in group" style="animation-delay: 200ms">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Current Streak</h3>
				<div class="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform pulse-glow">
					🔥
				</div>
			</div>
			<p class="text-4xl font-black text-orange-600 dark:text-orange-400 mb-2">{stats.activeStreak}</p>
			<p class="text-sm text-muted-foreground font-medium">
				{stats.activeStreak === 1 ? 'day' : 'days'} in a row
			</p>
		</div>

		<!-- Longest Streak -->
		<div class="notion-card p-6 shadow-xl hover:shadow-2xl fade-in group" style="animation-delay: 300ms">
			<div class="mb-4 flex items-center justify-between">
				<h3 class="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Best Streak</h3>
				<div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
					🏆
				</div>
			</div>
			<p class="text-4xl font-black text-purple-600 dark:text-purple-400 mb-2">{stats.longestStreak}</p>
			<p class="text-sm text-muted-foreground font-medium">Personal record</p>
		</div>
	</div>

	<!-- Enhanced Mood Trends Chart -->
	<div class="notion-card p-8 shadow-xl hover:shadow-2xl fade-in" style="animation-delay: 400ms">
		<div class="mb-6 flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
			<div>
				<h2 class="text-2xl font-bold text-foreground mb-2">Mood Trends Over Time</h2>
				<p class="text-muted-foreground text-sm">Track your emotional patterns and wellness progress</p>
			</div>

			<div class="flex flex-wrap gap-3">
				<!-- Time Range Selector -->
				<div class="flex gap-1 rounded-xl bg-secondary/50 p-1.5 backdrop-blur-sm">
					<button
						onclick={() => (timeRange = 'daily')}
						class="rounded-lg px-4 py-2.5 text-sm font-semibold transition-all {timeRange === 'daily'
							? 'bg-card text-primary shadow-lg scale-105'
							: 'text-muted-foreground hover:text-foreground hover:bg-card/50'}"
					>
						Daily
					</button>
					<button
						onclick={() => (timeRange = 'weekly')}
						class="rounded-lg px-4 py-2.5 text-sm font-semibold transition-all {timeRange === 'weekly'
							? 'bg-card text-primary shadow-lg scale-105'
							: 'text-muted-foreground hover:text-foreground hover:bg-card/50'}"
					>
						Weekly
					</button>
					<button
						onclick={() => (timeRange = 'monthly')}
						class="rounded-lg px-4 py-2.5 text-sm font-semibold transition-all {timeRange === 'monthly'
							? 'bg-card text-primary shadow-lg scale-105'
							: 'text-muted-foreground hover:text-foreground hover:bg-card/50'}"
					>
						Monthly
					</button>
				</div>

				<!-- Chart Type Selector -->
				<div class="flex gap-1 rounded-xl bg-secondary/50 p-1.5 backdrop-blur-sm">
					<button
						onclick={() => (chartType = 'line')}
						class="rounded-lg px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 {chartType === 'line'
							? 'bg-card text-primary shadow-lg scale-105'
							: 'text-muted-foreground hover:text-foreground hover:bg-card/50'}"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
						</svg>
						Line
					</button>
					<button
						onclick={() => (chartType = 'bar')}
						class="rounded-lg px-4 py-2.5 text-sm font-semibold transition-all flex items-center gap-2 {chartType === 'bar'
							? 'bg-card text-primary shadow-lg scale-105'
							: 'text-muted-foreground hover:text-foreground hover:bg-card/50'}"
					>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
						Bar
					</button>
				</div>
			</div>
		</div>

		<MoodTrendsChart data={data.chartData} {timeRange} {chartType} />
	</div>

	<!-- Sentiment Analysis -->
	<!-- Sentiment Distribution -->
		<div class="rounded-lg bg-card border border-border p-6 shadow">
			<h2 class="mb-4 text-xl font-bold text-foreground">Sentiment Analysis</h2>
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
						<div class="mb-1 flex items-center justify-between">
							<span class="text-sm font-medium text-foreground capitalize">
								{sentiment.toLowerCase()}
								{sentiment === 'POSITIVE' ? '😊' : sentiment === 'NEGATIVE' ? '😢' : '😐'}
							</span>
							<span class="text-sm text-muted-foreground">
								{count} ({percentage}%)
							</span>
						</div>
						<div class="bg-secondary h-2 w-full rounded-full">
							<div
								class="{color} h-2 rounded-full transition-all"
								style="width: {percentage}%"
							></div>
						</div>
					</div>
				{/each}
			</div>
		</div>

	<!-- Insights Section -->
	<div class="bg-muted/50 rounded-lg p-6 shadow">
		<h2 class="mb-4 text-xl font-bold">💡 Personalized Insights</h2>
		<div class="space-y-3">
			{#if stats.totalEntries === 0}
				<div class="flex items-start gap-3">
					<span class="text-2xl">🌱</span>
					<div>
						<p class="font-medium text-foreground">Just getting started</p>
						<p class="text-sm text-muted-foreground">
							You're building a great habit! Try to journal regularly to unlock deeper insights
							about your emotional patterns.
						</p>
					</div>
				</div>
			{:else}
				{#if stats.activeStreak >= 7}
				<div class="flex items-start gap-3">
					<span class="text-2xl">🎉</span>
					<div>
						<p class="font-medium text-foreground">Amazing streak!</p>
						<p class="text-sm text-muted-foreground">
							You've been journaling consistently for {stats.activeStreak} days. Keep up the great work!
						</p>
					</div>
				</div>
			{/if}

			{#if stats.avgSentiment > 50}
				<div class="flex items-start gap-3">
					<span class="text-2xl">🌟</span>
					<div>
						<p class="font-medium text-foreground">Very positive outlook</p>
						<p class="text-sm text-muted-foreground">
							Your recent entries show a very positive sentiment. You're doing great!
						</p>
					</div>
				</div>
			{:else if stats.avgSentiment < -30}
				<div class="flex items-start gap-3">
					<span class="text-2xl">💙</span>
					<div>
						<p class="font-medium text-foreground">We notice tough times</p>
						<p class="text-sm text-muted-foreground">
							Your entries suggest you might be going through a challenging period. Remember, it's
							okay to seek support.
						</p>
					</div>
				</div>
			{/if}

			{#if stats.entriesLast30Days > 20}
				<div class="flex items-start gap-3">
					<span class="text-2xl">📈</span>
					<div>
						<p class="font-medium text-foreground">Highly engaged</p>
						<p class="text-sm text-muted-foreground">
							You've journaled {stats.entriesLast30Days} times in the last month. Self-reflection is
							a powerful habit!
						</p>
					</div>
				</div>
			{:else if stats.entriesLast30Days >= 10}
				<div class="flex items-start gap-3">
					<span class="text-2xl">✨</span>
					<div>
						<p class="font-medium text-foreground">Building momentum</p>
						<p class="text-sm text-muted-foreground">
							{stats.entriesLast30Days} entries in the past month. You're developing a consistent journaling habit!
						</p>
					</div>
				</div>
			{:else if stats.totalEntries >= 5}
				<div class="flex items-start gap-3">
					<span class="text-2xl">📝</span>
					<div>
						<p class="font-medium text-foreground">Making progress</p>
						<p class="text-sm text-muted-foreground">
							You have {stats.totalEntries} journal entries. Keep going to discover more patterns in your emotional journey!
						</p>
					</div>
				</div>
			{/if}

			{#if stats.avgSentiment >= -10 && stats.avgSentiment <= 10 && stats.totalEntries >= 5}
				<div class="flex items-start gap-3">
					<span class="text-2xl">⚖️</span>
					<div>
						<p class="font-medium text-foreground">Balanced emotions</p>
						<p class="text-sm text-muted-foreground">
							Your entries show a balanced emotional state. You're experiencing a mix of different feelings.
						</p>
					</div>
				</div>
			{/if}

			{#if stats.totalEntries < 5 && stats.totalEntries > 0}
				<div class="flex items-start gap-3">
					<span class="text-2xl">🌱</span>
					<div>
						<p class="font-medium text-foreground">Just getting started</p>
						<p class="text-sm text-muted-foreground">
							You're building a great habit! Try to journal regularly to unlock deeper insights
							about your emotional patterns.
						</p>
					</div>
				</div>
			{/if}
			{/if}
		</div>
	</div>

	<!-- Predictive Insights -->
	{#if data.insights && stats.totalEntries >= 5}
		<div class="bg-muted/50 rounded-lg p-6 shadow">
			<h2 class="mb-4 text-xl font-bold">🔮 Predictive Insights</h2>

			{#if Object.keys(data.insights.dayOfWeekPattern).length === 0 && Object.keys(data.insights.timeOfDayPattern).length === 0 && !data.insights.forecast}
				<div class="flex items-start gap-3">
					<span class="text-2xl">📊</span>
					<div>
						<p class="font-medium text-foreground">Building your patterns</p>
						<p class="text-sm text-muted-foreground">
							Keep journaling to discover patterns in your mood based on the day of the week and time
							of day. We need at least 14 entries to show meaningful predictions.
						</p>
					</div>
				</div>
			{:else}
				{#if data.insights.forecast}
				<div class="bg-background/50 mb-6 rounded-lg p-4">
					<div class="flex items-start gap-3">
						<span class="text-3xl">
							{data.insights.trendDirection === 'improving'
								? '📈'
								: data.insights.trendDirection === 'declining'
									? '📉'
									: '📊'}
						</span>
						<div>
							<p class="mb-1 font-medium">Mood Trend</p>
							<p class="text-muted-foreground text-sm">{data.insights.forecast}</p>
						</div>
					</div>
				</div>
			{/if}

			<!-- Day of Week Patterns -->
			{#if Object.keys(data.insights.dayOfWeekPattern).length > 0}
				<div class="mb-6">
					<h3 class="mb-3 font-semibold">📅 Day of Week Patterns</h3>
					<div class="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-7">
						{#each ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as day}
							{@const dayData = data.insights.dayOfWeekPattern[day]}
							{#if dayData}
								{@const sentiment = Math.round(dayData.avgSentiment)}
								{@const color =
									sentiment > 30
										? 'bg-accent border-border'
										: sentiment < -30
											? 'bg-muted border-border'
											: 'bg-secondary border-border'}
								<div class="rounded-lg p-3 {color} border text-center">
									<div class="mb-1 text-xs font-medium">{day.slice(0, 3)}</div>
									<div class="text-lg font-bold">{sentiment > 0 ? '+' : ''}{sentiment}</div>
									<div class="text-muted-foreground text-xs">{dayData.count} entries</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<!-- Time of Day Patterns -->
			{#if Object.keys(data.insights.timeOfDayPattern).length > 0}
				<div class="mb-6">
					<h3 class="mb-3 font-semibold">🕐 Time of Day Patterns</h3>
					<div class="grid grid-cols-2 gap-3 md:grid-cols-4">
						{#each ['Morning', 'Afternoon', 'Evening', 'Night'] as time}
							{@const timeData = data.insights.timeOfDayPattern[time]}
							{#if timeData}
								{@const sentiment = Math.round(timeData.avgSentiment)}
								{@const emoji =
									time === 'Morning'
										? '🌅'
										: time === 'Afternoon'
											? '☀️'
											: time === 'Evening'
												? '🌆'
												: '🌙'}
								{@const color =
									sentiment > 20
										? 'bg-accent border-border'
										: sentiment < -20
											? 'bg-muted border-border'
											: 'bg-secondary border-border'}
								<div class="rounded-lg border-2 p-4 {color}">
									<div class="mb-2 flex items-center gap-2">
										<span class="text-2xl">{emoji}</span>
										<span class="font-medium">{time}</span>
									</div>
									<div class="text-2xl font-bold">
										{sentiment > 0 ? '+' : ''}{sentiment}
									</div>
									<div class="text-muted-foreground mt-1 text-xs">{timeData.count} entries</div>
								</div>
							{/if}
						{/each}
					</div>
				</div>
			{/if}

			<!-- Recommendations -->
			{#if data.insights.recommendations.length > 0}
				<div>
					<h3 class="mb-3 font-semibold">💭 Recommendations</h3>
					<div class="space-y-2">
						{#each data.insights.recommendations as recommendation}
							<div class="bg-background/50 flex items-start gap-2 rounded-lg p-3">
								<span class="text-lg">💡</span>
								<p class="text-muted-foreground text-sm">{recommendation}</p>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			{/if}
		</div>
	{/if}

	<!-- Quick Actions -->
	<div class="flex justify-center gap-4">
		<a
			href="/journal"
			class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-6 py-3 font-medium transition-colors"
		>
			Write New Entry
		</a>
		<a
			href="/journal/export"
			class="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg px-6 py-3 font-medium transition-colors"
		>
			Export Journal
		</a>
	</div>
</div>
