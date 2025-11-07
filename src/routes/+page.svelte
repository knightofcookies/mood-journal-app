<script lang="ts">
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();

	const features = [
		{
			icon: '🧠',
			title: 'AI-Powered Insights',
			description: 'Analyze sentiment and emotional patterns in your journal entries.'
		},
		{
			icon: '📊',
			title: 'Visual Analytics',
			description: 'Track your mood trends and journaling streaks with interactive charts.'
		},
		{
			icon: '💬',
			title: 'AI Companion',
			description: 'Chat with an AI companion for reflection and guidance.'
		},
		{
			icon: '🔒',
			title: 'Privacy First',
			description: 'Your entries are private and secure. Your data stays yours.'
		}
	];
</script>

<svelte:head>
	<title>Mood Journal</title>
	<meta
		name="description"
		content="A private space for reflection and growth with AI-powered insights."
	/>
</svelte:head>

<div class="min-h-screen bg-background">
	<!-- Simple Header for Landing Page -->
	<header class="border-b border-border">
		<div class="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
			<div class="flex items-center gap-2 text-lg font-semibold">
				<span>📔</span>
				<span>Mood Journal</span>
			</div>
			<div class="flex items-center gap-3">
				{#if data?.user}
					<Button href="/journal" variant="default">Go to Journal</Button>
				{:else}
					<Button href="/auth/login" variant="ghost">Sign in</Button>
					<Button href="/auth/register">Get Started</Button>
				{/if}
			</div>
		</div>
	</header>

	<!-- Hero Section (Notion-style) -->
	<section class="relative overflow-hidden">
		<div class="mx-auto max-w-6xl px-6 py-20 sm:py-32">
			<div class="space-y-8 text-center">
				<!-- Headline -->
				<h1 class="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
					<span
						class="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent dark:text-white"
					>
						Your Thoughts,
					</span>
					<br />
					<span
						class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400"
					>
						Understood & Analyzed
					</span>
				</h1>

				<!-- Subheadline -->
				<p class="text-muted-foreground mx-auto max-w-2xl text-lg sm:text-xl">
					A private space for reflection and growth with AI-powered insights.
				</p>

				<!-- CTA Buttons -->
				<div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
					{#if data.user}
						<Button href="/journal" size="lg" class="px-8 py-6 text-lg">Go to Journal →</Button>
						<Button href="/journal/analytics" variant="outline" size="lg" class="px-8 py-6 text-lg">
							View Analytics
						</Button>
					{:else}
						<Button href="/auth/register" size="lg" class="px-8 py-6 text-lg">
							Start Journaling
						</Button>
						<Button href="/auth/login" variant="outline" size="lg" class="px-8 py-6 text-lg">
							Sign In
						</Button>
					{/if}
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="bg-background py-20 border-t border-border">
		<div class="mx-auto max-w-6xl px-6">
			<div class="mb-16 text-center">
				<h2 class="mb-4 text-3xl font-bold sm:text-4xl">
					Mindful Journaling with AI
				</h2>
				<p class="text-muted-foreground mx-auto max-w-2xl text-lg">
					Understand your emotional patterns and track your journey.
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
				{#each features as feature}
					<div class="text-center">
						<div class="mb-4 text-5xl">{feature.icon}</div>
						<h3 class="mb-2 text-lg font-semibold">{feature.title}</h3>
						<p class="text-muted-foreground text-sm">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Footer -->
	<footer class="border-t border-border bg-background py-8">
		<div class="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
			<p>© 2025 Mood Journal. Built for mindful reflection.</p>
		</div>
	</footer>
</div>
