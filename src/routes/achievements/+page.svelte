<script lang="ts">
	import { goto } from '$app/navigation';

	let { data } = $props();

	function getCategoryColor(category: string) {
		const colors = {
			milestone: 'bg-blue-500',
			consistency: 'bg-green-500',
			quality: 'bg-purple-500',
			exploration: 'bg-orange-500',
			wellness: 'bg-pink-500'
		};
		return colors[category as keyof typeof colors] || 'bg-gray-500';
	}

	function getCategoryIcon(category: string) {
		const icons = {
			milestone: '🏆',
			consistency: '📅',
			quality: '✨',
			exploration: '🔍',
			wellness: '🧘'
		};
		return icons[category as keyof typeof icons] || '🎯';
	}
</script>

<svelte:head>
	<title>Achievements - Mood Journal</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8">
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">🏆 Achievements</h1>
		<p class="text-muted-foreground">Track your progress and unlock achievements</p>
	</div>

	<div class="space-y-8">
		<!-- Progress Overview -->
		<div class="rounded-lg bg-card border border-border p-6 shadow-sm">
			<div class="mb-6 flex items-center justify-between">
				<h2 class="text-xl font-semibold">Your Progress</h2>
				<div class="text-right">
					<div class="text-2xl font-bold text-primary">
						Level {data.progress.level}
					</div>
					<div class="text-sm text-muted-foreground">
						{data.progress.totalXP} XP Total
					</div>
				</div>
			</div>

			<!-- XP Progress Bar -->
			<div class="mb-4">
				<div class="mb-1 flex justify-between text-sm text-muted-foreground">
					<span>Level {data.progress.level}</span>
					<span>{data.progress.xpToNextLevel} XP to Level {data.progress.level + 1}</span>
				</div>
				<div class="h-3 w-full rounded-full bg-secondary">
					<div
						class="h-3 rounded-full bg-primary transition-all duration-300"
						style="width: {(data.progress.currentXP /
							(data.progress.currentXP + data.progress.xpToNextLevel)) *
							100}%"
					></div>
				</div>
			</div>

			<!-- Stats -->
			<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
				<div class="text-center">
					<div class="text-2xl font-bold text-foreground">
						{data.progress.achievementsUnlocked}
					</div>
					<div class="text-sm text-muted-foreground">Unlocked</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-foreground">
						{data.progress.totalAchievements - data.progress.achievementsUnlocked}
					</div>
					<div class="text-sm text-muted-foreground">Remaining</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-foreground">
						{data.progress.totalXP}
					</div>
					<div class="text-sm text-muted-foreground">Total XP</div>
				</div>
				<div class="text-center">
					<div class="text-2xl font-bold text-foreground">
						{Math.round(
							(data.progress.achievementsUnlocked / data.progress.totalAchievements) * 100
						)}%
					</div>
					<div class="text-sm text-muted-foreground">Complete</div>
				</div>
			</div>
		</div>

		<!-- Achievements Grid -->
		<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.achievements as achievement}
				<div
					class="rounded-lg border-2 bg-card p-6 shadow-sm transition-all duration-200 {achievement.unlocked
						? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20'
						: 'border-border'}"
				>
					<div class="flex items-start gap-4">
						<div class="mb-2 text-3xl">{achievement.icon}</div>
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-2">
								<h3 class="font-semibold text-foreground">{achievement.title}</h3>
								{#if achievement.unlocked}
									<span class="text-yellow-500">🏆</span>
								{/if}
							</div>
							<p class="mb-3 text-sm text-muted-foreground">{achievement.description}</p>

							<!-- Category Badge -->
							<div class="mb-3 flex items-center gap-2">
								<span class="text-lg">{getCategoryIcon(achievement.category)}</span>
								<span
									class="rounded-full bg-secondary px-2 py-1 text-xs capitalize text-secondary-foreground"
								>
									{achievement.category}
								</span>
							</div>

							<!-- Progress -->
							{#if achievement.requirement > 1}
								<div class="mb-2">
									<div class="mb-1 flex justify-between text-sm text-muted-foreground">
										<span>Progress</span>
										<span>{achievement.progress}/{achievement.requirement}</span>
									</div>
									<div class="h-2 w-full rounded-full bg-secondary">
										<div
											class="h-2 rounded-full bg-primary transition-all duration-300"
											style="width: {Math.min(
												(achievement.progress / achievement.requirement) * 100,
												100
											)}%"
										></div>
									</div>
								</div>
							{/if}

							<!-- XP Reward -->
							<div class="flex items-center justify-between">
								<div class="text-sm text-muted-foreground">
									{achievement.unlocked ? 'Unlocked' : 'Locked'}
									{#if achievement.unlockedAt}
										<span class="block text-xs">
											{new Date(achievement.unlockedAt).toLocaleDateString()}
										</span>
									{/if}
								</div>
								<div class="text-sm font-medium text-primary">
									+{achievement.xp} XP
								</div>
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
