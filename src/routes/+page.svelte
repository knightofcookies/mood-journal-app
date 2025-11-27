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

<div class="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
	<!-- Animated background elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
		<div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
	</div>

	<!-- Modern Header for Landing Page -->
	<header class="border-b border-border/50 backdrop-blur-md bg-card/80 sticky top-0 z-50 shadow-sm">
		<div class="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
			<a href="/" class="flex items-center gap-3 text-xl font-bold group">
				<span class="text-3xl transform transition-transform group-hover:scale-110 group-hover:rotate-12 floating">📔</span>
				<span class="gradient-text">Mood Journal</span>
			</a>
			<div class="flex items-center gap-4">
				{#if data?.user}
					<Button href="/journal" variant="default" class="notion-btn-primary shadow-lg hover:shadow-xl transition-all">
						<span>Go to Journal</span>
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</Button>
				{:else}
					<Button href="/auth/login" variant="ghost" class="notion-btn">Sign in</Button>
					<Button href="/auth/register" class="notion-btn-primary shadow-lg hover:shadow-xl">
						Get Started
						<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
						</svg>
					</Button>
				{/if}
			</div>
		</div>
	</header>

	<!-- Hero Section (Modern Premium Style) -->
	<section class="relative overflow-hidden">
		<div class="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
			<div class="space-y-10 text-center fade-in">
				<!-- Badge -->
				<div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium text-sm backdrop-blur-sm">
					<span class="relative flex h-2 w-2">
						<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
						<span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
					</span>
					AI-Powered Journaling Platform
				</div>
				
				<!-- Headline with gradient -->
				<h1 class="text-6xl font-black tracking-tight sm:text-7xl lg:text-8xl leading-tight">
					<span
						class="block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-white dark:via-gray-200 dark:to-gray-400"
					>
						Your Thoughts,
					</span>
					<span
						class="block mt-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 floating"
					>
						Beautifully Understood
					</span>
				</h1>

				<!-- Subheadline -->
				<p class="text-muted-foreground mx-auto max-w-3xl text-xl sm:text-2xl leading-relaxed font-light">
					A private sanctuary for reflection and personal growth, powered by cutting-edge AI to help you understand your emotional journey.
				</p>

				<!-- CTA Buttons with enhanced styling -->
				<div class="flex flex-col items-center justify-center gap-6 sm:flex-row pt-4">
					{#if data.user}
						<Button href="/journal" size="lg" class="notion-btn-primary text-lg px-10 py-7 shadow-2xl hover:shadow-3xl group relative overflow-hidden">
							<span class="relative z-10 flex items-center gap-3">
								Start Writing
								<svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</span>
						</Button>
						<Button href="/journal/analytics" variant="outline" size="lg" class="glass-card px-10 py-7 text-lg border-2 hover:border-primary/50 group">
							<span class="flex items-center gap-3">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
								</svg>
								View Analytics
								<svg class="w-4 h-4 opacity-0 -ml-2 transition-all group-hover:opacity-100 group-hover:ml-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</span>
						</Button>
					{:else}
						<Button href="/auth/register" size="lg" class="notion-btn-primary text-lg px-10 py-7 shadow-2xl hover:shadow-3xl group relative overflow-hidden">
							<span class="relative z-10 flex items-center gap-3">
								Start Your Journey
								<svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</span>
						</Button>
						<Button href="/auth/login" variant="outline" size="lg" class="glass-card px-10 py-7 text-lg border-2 hover:border-primary/50 group">
							<span class="flex items-center gap-3">
								Sign In
								<svg class="w-4 h-4 opacity-0 -ml-2 transition-all group-hover:opacity-100 group-hover:ml-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
								</svg>
							</span>
						</Button>
					{/if}
				</div>
				
				<!-- Social proof -->
				<div class="pt-8 flex items-center justify-center gap-8 text-sm text-muted-foreground">
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
						<span>100% Private & Secure</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
						</svg>
						<span>AI-Powered Insights</span>
					</div>
					<div class="flex items-center gap-2">
						<svg class="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
						</svg>
						<span>Free Forever</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Features Section with modern cards -->
	<section class="relative py-24 border-t border-border/50">
		<div class="mx-auto max-w-7xl px-6">
			<div class="mb-20 text-center fade-in">
				<h2 class="mb-6 text-4xl sm:text-5xl font-bold">
					<span class="gradient-text">Mindful Journaling with AI</span>
				</h2>
				<p class="text-muted-foreground mx-auto max-w-3xl text-xl leading-relaxed">
					Transform your journaling experience with intelligent features designed to help you understand your emotional patterns and track your personal growth journey.
				</p>
			</div>

			<div class="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
				{#each features as feature, index}
					<div class="notion-card p-8 text-center group fade-in" style="animation-delay: {index * 100}ms">
						<div class="mb-6 text-6xl floating group-hover:scale-110 transition-transform duration-300" style="animation-delay: {index * 0.5}s">{feature.icon}</div>
						<h3 class="mb-4 text-xl font-bold group-hover:text-primary transition-colors">{feature.title}</h3>
						<p class="text-muted-foreground leading-relaxed">{feature.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Premium Footer -->
	<footer class="border-t border-border/50 bg-card/30 backdrop-blur-sm py-12 mt-24">
		<div class="mx-auto max-w-7xl px-6">
			<div class="flex flex-col md:flex-row items-center justify-between gap-6">
				<div class="flex items-center gap-3">
					<span class="text-3xl floating">📔</span>
					<div>
						<p class="font-bold gradient-text">Mood Journal</p>
						<p class="text-sm text-muted-foreground">Built for mindful reflection</p>
					</div>
				</div>
				<div class="text-sm text-muted-foreground">
					<p>© 2025 Mood Journal. Crafted with 💜 for your mental wellness.</p>
				</div>
			</div>
		</div>
	</footer>
</div>
