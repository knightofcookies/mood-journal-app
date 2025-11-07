<script lang="ts">
	import { goto } from '$app/navigation';
	import BreathingExercise from '$lib/components/BreathingExercise.svelte';

	let { data } = $props();

	let showBreathingExercise = $state(false);
	let selectedExercise: 'box' | '478' = $state('box');

	function getPriorityColor(priority: string) {
		switch (priority) {
			case 'high':
				return 'border-red-500 bg-red-100 dark:bg-red-900/20';
			case 'medium':
				return 'border-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
			case 'low':
				return 'border-green-500 bg-green-100 dark:bg-green-900/20';
			default:
				return 'border-gray-500 bg-gray-100 dark:bg-gray-700/20';
		}
	}

	function getTypeIcon(type: string) {
		switch (type) {
			case 'breathing':
				return '🫁';
			case 'meditation':
				return '🧘';
			case 'activity':
				return '🏃';
			case 'prompt':
				return '✍️';
			case 'resource':
				return '📚';
			case 'insight':
				return '💡';
			default:
				return '🎯';
		}
	}
</script>

<svelte:head>
	<title>Wellness - Mood Journal</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="mx-auto max-w-6xl px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="mb-2 text-3xl font-bold text-foreground">Wellness Center</h1>
			<p class="text-muted-foreground">
				Personalized recommendations to support your mental wellness journey
			</p>
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Main Content -->
			<div class="space-y-8 lg:col-span-2">
				<!-- Personalized Recommendations -->
				{#if data.recommendations.length > 0}
					<div class="rounded-lg bg-card p-6 shadow-sm border">
						<h2 class="mb-4 text-xl font-semibold text-foreground">
							Personalized for You
						</h2>
						<div class="space-y-4">
							{#each data.recommendations as recommendation}
								<div
									class="rounded-r-lg border-l-4 p-4 {getPriorityColor(recommendation.priority)}"
								>
									<div class="flex items-start gap-3">
										<span class="text-2xl">{recommendation.icon}</span>
										<div class="flex-1">
											<div class="mb-1 flex items-center gap-2">
												<h3 class="font-medium text-foreground">
													{recommendation.title}
												</h3>
												<span
													class="rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground capitalize"
												>
													{recommendation.type}
												</span>
												{#if recommendation.duration}
													<span class="text-xs text-muted-foreground"
														>{recommendation.duration}</span
													>
												{/if}
											</div>
											<p class="mb-2 text-sm text-muted-foreground">
												{recommendation.description}
											</p>
											{#if recommendation.url}
												<a
													href={recommendation.url}
													target="_blank"
													rel="noopener noreferrer"
													class="text-sm text-blue-600 hover:underline dark:text-blue-400"
												>
													Learn more →
												</a>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Journaling Prompts -->
				<div class="rounded-lg bg-card p-6 shadow-sm border">
					<h2 class="mb-4 text-xl font-semibold text-foreground">
						Journaling Prompts
					</h2>
					<div class="space-y-3">
						{#each data.prompts as prompt, i}
							<div class="flex items-start gap-3 rounded-lg bg-secondary p-3">
								<span class="mt-0.5 text-lg">💭</span>
								<p class="flex-1 text-secondary-foreground">{prompt}</p>
							</div>
						{/each}
					</div>
					<button
						onclick={() => goto('/journal/new')}
						class="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
					>
						Start Journaling
					</button>
				</div>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Interactive Breathing Exercise -->
				{#if showBreathingExercise}
					<div class="rounded-lg bg-card p-6 shadow-sm border">
						<div class="mb-4 flex items-center justify-between">
							<h3 class="text-lg font-semibold text-foreground">
								Breathing Exercise
							</h3>
							<button
								onclick={() => (showBreathingExercise = false)}
								class="text-sm text-muted-foreground hover:text-foreground"
							>
								Close
							</button>
						</div>
						<div class="mb-4">
							<div class="flex gap-2">
								<button
									onclick={() => (selectedExercise = 'box')}
									class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors {selectedExercise ===
									'box'
										? 'bg-primary text-primary-foreground'
										: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
								>
									Box Breathing
								</button>
								<button
									onclick={() => (selectedExercise = '478')}
									class="flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors {selectedExercise ===
									'478'
										? 'bg-primary text-primary-foreground'
										: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
								>
									4-7-8 Breathing
								</button>
							</div>
						</div>
						<BreathingExercise exercise={selectedExercise} />
					</div>
				{/if}

				<!-- Breathing Exercises List -->
				<div class="rounded-lg bg-card p-6 shadow-sm border">
					<h3 class="mb-4 text-lg font-semibold text-foreground">
						Breathing Exercises
					</h3>
					<div class="space-y-4">
						{#each data.breathingExercises as exercise}
							<div class="rounded-lg border p-4">
								<h4 class="mb-2 font-medium text-foreground">{exercise.name}</h4>
								<p class="mb-3 text-sm text-muted-foreground">{exercise.description}</p>
								<div class="mb-2 text-xs text-muted-foreground">
									<strong>Duration:</strong>
									{exercise.duration}
								</div>
								<button
									onclick={() => {
										selectedExercise = exercise.name === 'Box Breathing' ? 'box' : '478';
										showBreathingExercise = true;
									}}
									class="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
								>
									Try It Now
								</button>
							</div>
						{/each}
					</div>
				</div>

				<!-- Quick Actions -->
				<div class="rounded-lg bg-card p-6 shadow-sm border">
					<h3 class="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
					<div class="space-y-2">
						<button
							onclick={() => goto('/journal/new')}
							class="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
						>
							<div class="flex items-center gap-3">
								<span class="text-lg">📝</span>
								<div>
									<div class="font-medium text-foreground">New Entry</div>
									<div class="text-sm text-muted-foreground">Start writing</div>
								</div>
							</div>
						</button>

						<button
							onclick={() => goto('/journal/analytics')}
							class="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
						>
							<div class="flex items-center gap-3">
								<span class="text-lg">📊</span>
								<div>
									<div class="font-medium text-foreground">View Analytics</div>
									<div class="text-sm text-muted-foreground">Track your progress</div>
								</div>
							</div>
						</button>

						<button
							onclick={() => goto('/achievements')}
							class="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent"
						>
							<div class="flex items-center gap-3">
								<span class="text-lg">🏆</span>
								<div>
									<div class="font-medium text-foreground">Achievements</div>
									<div class="text-sm text-muted-foreground">View your progress</div>
								</div>
							</div>
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
