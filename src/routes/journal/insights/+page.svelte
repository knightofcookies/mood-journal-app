<script lang="ts">
	/* eslint-disable @typescript-eslint/no-explicit-any */
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import { format } from 'date-fns';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();

	Chart.register(...registerables);

	let sentimentChartCanvas = $state<HTMLCanvasElement>();
	let moodChartCanvas = $state<HTMLCanvasElement>();
	let tagChartCanvas = $state<HTMLCanvasElement>();
	let sentimentChart: Chart | null = null;
	let moodChart: Chart | null = null;
	let tagChart: Chart | null = null;

	onMount(() => {
		createSentimentChart();
		createMoodChart();
		createTagChart();

		return () => {
			sentimentChart?.destroy();
			moodChart?.destroy();
			tagChart?.destroy();
		};
	});

	function createSentimentChart() {
		if (!sentimentChartCanvas || data.dailyData.length === 0) return;

		const ctx = sentimentChartCanvas.getContext('2d');
		if (!ctx) return;

		sentimentChart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: data.dailyData.map((d: any) => format(new Date(d.date), 'MMM dd')),
				datasets: [
					{
						label: 'Daily Sentiment',
						data: data.dailyData.map((d: any) => d.averageSentiment),
						borderColor: 'rgb(59, 130, 246)',
						backgroundColor: 'rgba(59, 130, 246, 0.1)',
						tension: 0.4,
						fill: true,
						pointRadius: 4,
						pointHoverRadius: 6
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const value = context.parsed.y ?? 0;
								const sentiment = value > 30 ? 'Positive' : value < -30 ? 'Negative' : 'Neutral';
								return `Sentiment: ${value} (${sentiment})`;
							}
						}
					}
				},
				scales: {
					y: {
						beginAtZero: false,
						min: -100,
						max: 100,
						ticks: {
							callback: (value) => {
								if (value === 100) return 'Very Positive';
								if (value === 50) return 'Positive';
								if (value === 0) return 'Neutral';
								if (value === -50) return 'Negative';
								if (value === -100) return 'Very Negative';
								return '';
							}
						},
						grid: {
							color: (context) => {
								if (context.tick.value === 0) return 'rgba(0, 0, 0, 0.2)';
								return 'rgba(0, 0, 0, 0.05)';
							}
						}
					}
				}
			}
		});
	}

	function createMoodChart() {
		if (!moodChartCanvas || data.moodDistribution.length === 0) return;

		const ctx = moodChartCanvas.getContext('2d');
		if (!ctx) return;

		const moodColors: Record<string, string> = {
			happy: 'rgb(34, 197, 94)',
			neutral: 'rgb(234, 179, 8)',
			sad: 'rgb(239, 68, 68)',
			anxious: 'rgb(168, 85, 247)',
			excited: 'rgb(59, 130, 246)',
			calm: 'rgb(20, 184, 166)'
		};

		moodChart = new Chart(ctx, {
			type: 'doughnut',
			data: {
				labels: data.moodDistribution.map(
					(d: any) => d.mood.charAt(0).toUpperCase() + d.mood.slice(1)
				),
				datasets: [
					{
						data: data.moodDistribution.map((d: any) => d.count),
						backgroundColor: data.moodDistribution.map(
							(d: any) => moodColors[d.mood] || 'rgb(148, 163, 184)'
						),
						borderWidth: 2,
						borderColor: '#fff'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'bottom',
						labels: {
							padding: 15,
							font: {
								size: 12
							}
						}
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const label = context.label || '';
								const value = context.parsed;
								const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
								const percentage = ((value / total) * 100).toFixed(1);
								return `${label}: ${value} (${percentage}%)`;
							}
						}
					}
				}
			}
		});
	}

	function createTagChart() {
		if (!tagChartCanvas || data.tagCorrelation.length === 0) return;

		const ctx = tagChartCanvas.getContext('2d');
		if (!ctx) return;

		tagChart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: data.tagCorrelation.map((d: any) => d.tag),
				datasets: [
					{
						label: 'Average Sentiment',
						data: data.tagCorrelation.map((d: any) => d.averageSentiment),
						backgroundColor: data.tagCorrelation.map((d: any) => {
							const score = d.averageSentiment;
							if (score > 30) return 'rgba(34, 197, 94, 0.7)';
							if (score < -30) return 'rgba(239, 68, 68, 0.7)';
							return 'rgba(234, 179, 8, 0.7)';
						}),
						borderColor: data.tagCorrelation.map((d: any) => {
							const score = d.averageSentiment;
							if (score > 30) return 'rgb(34, 197, 94)';
							if (score < -30) return 'rgb(239, 68, 68)';
							return 'rgb(234, 179, 8)';
						}),
						borderWidth: 2
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				indexAxis: 'y',
				plugins: {
					legend: {
						display: false
					},
					tooltip: {
						callbacks: {
							label: (context) => {
								const value = context.parsed.x ?? 0;
								const sentiment = value > 30 ? 'Positive' : value < -30 ? 'Negative' : 'Neutral';
								const tag = data.tagCorrelation[context.dataIndex];
								return [`Sentiment: ${value} (${sentiment})`, `Appears in ${tag.count} entries`];
							}
						}
					}
				},
				scales: {
					x: {
						beginAtZero: false,
						min: -100,
						max: 100
					}
				}
			}
		});
	}

	function getSentimentEmoji(score: number): string {
		if (score > 30) return '😊';
		if (score < -30) return '😔';
		return '😐';
	}

	function getSentimentLabel(score: number): string {
		if (score > 60) return 'Very Positive';
		if (score > 30) return 'Positive';
		if (score < -60) return 'Very Negative';
		if (score < -30) return 'Negative';
		return 'Neutral';
	}

	function changeRange(newRange: string) {
		window.location.href = `/journal/insights?range=${newRange}`;
	}
</script>

<div class="container mx-auto max-w-6xl p-6">
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">📊 Insights & Analytics</h1>
			<p class="text-muted-foreground mt-1 text-sm">Your emotional journey visualized</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" href="/journal">← Back to Journal</Button>
			<select
				value={data.range.toString()}
				onchange={(e) => changeRange(e.currentTarget.value)}
				class="border-input bg-background ring-offset-background focus-visible:ring-ring rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
			>
				<option value="7">Last 7 days</option>
				<option value="30">Last 30 days</option>
				<option value="90">Last 90 days</option>
				<option value="365">Last year</option>
				<option value="3650">All time</option>
			</select>
		</div>
	</div>

	{#if data.totalEntries === 0}
		<Card.Root>
			<Card.Content class="py-12 text-center">
				<p class="text-muted-foreground mb-4 text-lg">
					No journal entries found for this time period.
				</p>
				<Button href="/journal">Create your first entry</Button>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- Statistics Cards -->
		<div class="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-muted-foreground text-sm font-medium">
						Average Sentiment
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<div>
							<div class="text-3xl font-bold">
								{data.stats.averageSentiment}
							</div>
							<p class="text-muted-foreground mt-1 text-xs">
								{getSentimentLabel(data.stats.averageSentiment)}
							</p>
						</div>
						<div class="text-4xl">
							{getSentimentEmoji(data.stats.averageSentiment)}
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-muted-foreground text-sm font-medium">Total Entries</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<div>
							<div class="text-3xl font-bold">{data.stats.totalEntries}</div>
							<p class="text-muted-foreground mt-1 text-xs">
								{data.range} day{data.range > 1 ? 's' : ''}
							</p>
						</div>
						<div class="text-4xl">📝</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-muted-foreground text-sm font-medium">Current Streak</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<div>
							<div class="text-3xl font-bold">{data.stats.currentStreak}</div>
							<p class="text-muted-foreground mt-1 text-xs">consecutive days</p>
						</div>
						<div class="text-4xl">🔥</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-muted-foreground text-sm font-medium">Longest Streak</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<div>
							<div class="text-3xl font-bold">{data.stats.longestStreak}</div>
							<p class="text-muted-foreground mt-1 text-xs">personal record</p>
						</div>
						<div class="text-4xl">🏆</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Sentiment Breakdown -->
		<div class="mb-6 grid gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Content class="py-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-muted-foreground text-sm font-medium">Positive</p>
							<p class="text-2xl font-bold text-green-600">{data.stats.positiveCount}</p>
						</div>
						<div class="text-3xl">😊</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="py-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-muted-foreground text-sm font-medium">Neutral</p>
							<p class="text-2xl font-bold text-yellow-600">{data.stats.neutralCount}</p>
						</div>
						<div class="text-3xl">😐</div>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Content class="py-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="text-muted-foreground text-sm font-medium">Negative</p>
							<p class="text-2xl font-bold text-red-600">{data.stats.negativeCount}</p>
						</div>
						<div class="text-3xl">😔</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Charts -->
		<div class="mb-6 grid gap-6 lg:grid-cols-2">
			<!-- Sentiment Over Time -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Sentiment Over Time</Card.Title>
					<Card.Description>Track your emotional patterns day by day</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="h-[300px]">
						<canvas bind:this={sentimentChartCanvas}></canvas>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Mood Distribution -->
			<Card.Root>
				<Card.Header>
					<Card.Title>Mood Distribution</Card.Title>
					<Card.Description>How often do you feel each mood?</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="h-[300px]">
						<canvas bind:this={moodChartCanvas}></canvas>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Tag Correlation -->
		{#if data.tagCorrelation.length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>Topics & Sentiment</Card.Title>
					<Card.Description>
						How different topics correlate with your emotional state
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="h-[400px]">
						<canvas bind:this={tagChartCanvas}></canvas>
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Discovered Topics -->
		{#if data.topics && data.topics.length > 0}
			<Card.Root class="mt-6">
				<Card.Header>
					<Card.Title>🔍 Discovered Themes</Card.Title>
					<Card.Description>AI-detected topics and patterns in your journal</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{#each data.topics as topic (topic.id)}
							<Card.Root class="border-2">
								<Card.Header class="pb-3">
									<Card.Title class="flex items-center justify-between text-base">
										<span>{topic.name}</span>
										<Badge variant="secondary">{topic.entryCount}</Badge>
									</Card.Title>
								</Card.Header>
								<Card.Content class="space-y-3">
									<div class="flex flex-wrap gap-1.5">
										{#each topic.keywords as keyword (keyword)}
											<Badge variant="outline" class="text-xs">
												{keyword}
											</Badge>
										{/each}
									</div>
									<div class="flex items-center gap-2">
										<span class="text-2xl">
											{topic.averageSentiment > 30
												? '😊'
												: topic.averageSentiment < -30
													? '😔'
													: '😐'}
										</span>
										<div class="flex-1">
											<div class="text-sm font-medium">
												{topic.averageSentiment > 30
													? 'Positive'
													: topic.averageSentiment < -30
														? 'Negative'
														: 'Neutral'}
											</div>
											<div class="text-muted-foreground text-xs">
												Average sentiment: {topic.averageSentiment}
											</div>
										</div>
									</div>
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>
