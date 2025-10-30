<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Card from '$lib/components/ui/card';
	
	let { data } = $props();
	
	const features = [
		{
			icon: '🧠',
			title: 'AI-Powered Insights',
			description: 'Get deep insights into your emotional patterns with advanced sentiment analysis and personalized recommendations.'
		},
		{
			icon: '📊',
			title: 'Visual Analytics',
			description: 'Track your mood trends, streaks, and progress with beautiful, interactive charts and visualizations.'
		},
		{
			icon: '💬',
			title: 'AI Companion',
			description: 'Chat with your personal AI wellness companion that understands your journey and offers thoughtful guidance.'
		},
		{
			icon: '🔒',
			title: 'Privacy First',
			description: 'Your thoughts are yours alone. Enterprise-grade security with end-to-end encryption options.'
		},
		{
			icon: '🎯',
			title: 'Smart Search',
			description: 'Find any entry instantly with semantic search, keyword filtering, and mood-based discovery.'
		},
		{
			icon: '📱',
			title: 'Works Everywhere',
			description: 'Seamless experience across desktop, mobile, and tablet with offline support coming soon.'
		}
	];
	
	const testimonials = [
		{
			quote: 'This app helped me understand my anxiety patterns and break negative cycles.',
			author: 'Sarah M.',
			mood: '😊'
		},
		{
			quote: 'The AI companion feels like talking to a caring friend who really gets me.',
			author: 'Alex K.',
			mood: '🤗'
		},
		{
			quote: 'Seeing my progress visually motivated me to keep journaling every day.',
			author: 'Jordan L.',
			mood: '🎯'
		}
	];
	
	const stats = [
		{ value: '10,000+', label: 'Journal Entries' },
		{ value: '95%', label: 'User Satisfaction' },
		{ value: '50+', label: 'Days Average Streak' },
		{ value: '24/7', label: 'AI Support' }
	];
</script>

<svelte:head>
	<title>Mood Journal - Your Intelligent Wellness Companion</title>
	<meta name="description" content="Transform your mental wellness journey with AI-powered insights, sentiment analysis, and personalized guidance. Start journaling smarter today." />
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-background to-secondary/20">
	<!-- Hero Section -->
	<section class="relative overflow-hidden">
		<!-- Decorative background -->
		<div class="absolute inset-0 bg-grid-slate-900/[0.04] dark:bg-grid-slate-100/[0.03] bg-[size:75px_75px]" aria-hidden="true"></div>
		<div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" aria-hidden="true"></div>
		
		<div class="relative max-w-6xl mx-auto px-4 py-20 sm:py-32">
			<div class="text-center space-y-8">
				<!-- Badge -->
				<div class="flex justify-center">
					<Badge variant="secondary" class="px-4 py-1.5 text-sm">
						✨ AI-Powered Journaling Platform
					</Badge>
				</div>
				
				<!-- Headline -->
				<h1 class="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
					<span class="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
						Your Thoughts,
					</span>
					<br />
					<span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
						Understood & Analyzed
					</span>
				</h1>
				
				<!-- Subheadline -->
				<p class="max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground">
					Transform your mental wellness journey with AI-powered insights, sentiment analysis, 
					and personalized guidance. Your private space for reflection and growth.
				</p>
				
				<!-- CTA Buttons -->
				<div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
					{#if data.user}
						<Button href="/journal" size="lg" class="text-lg px-8 py-6">
							Go to Journal →
						</Button>
						<Button href="/journal/analytics" variant="outline" size="lg" class="text-lg px-8 py-6">
							View Analytics
						</Button>
					{:else}
						<Button href="/auth/register" size="lg" class="text-lg px-8 py-6">
							Start Journaling Free
						</Button>
						<Button href="/auth/login" variant="outline" size="lg" class="text-lg px-8 py-6">
							Sign In
						</Button>
					{/if}
				</div>
				
				<!-- Social Proof -->
				<div class="flex flex-wrap justify-center items-center gap-8 pt-8 text-sm text-muted-foreground">
					<div class="flex items-center gap-2">
						<div class="flex -space-x-2">
							{#each [1, 2, 3, 4] as i}
								<div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 border-2 border-background"></div>
							{/each}
						</div>
						<span>Trusted by thousands</span>
					</div>
					<div class="flex items-center gap-1">
						<span class="text-yellow-500">★★★★★</span>
						<span>4.9/5 rating</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Stats Section -->
	<section class="py-16 bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/5 dark:to-purple-600/5">
		<div class="max-w-6xl mx-auto px-4">
			<div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
				{#each stats as stat}
					<div class="text-center">
						<div class="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
							{stat.value}
						</div>
						<div class="text-sm text-muted-foreground mt-2">{stat.label}</div>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Features Section -->
	<section class="py-20 bg-background">
		<div class="max-w-6xl mx-auto px-4">
			<div class="text-center mb-16">
				<Badge variant="secondary" class="mb-4">Features</Badge>
				<h2 class="text-3xl sm:text-4xl font-bold mb-4">
					Everything You Need for Mindful Journaling
				</h2>
				<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
					Powerful features designed to help you understand yourself better and build lasting wellness habits.
				</p>
			</div>
			
			<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each features as feature}
					<Card.Card class="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
						<Card.CardHeader>
							<div class="text-5xl mb-4 group-hover:scale-110 transition-transform">
								{feature.icon}
							</div>
							<Card.CardTitle class="text-xl">{feature.title}</Card.CardTitle>
						</Card.CardHeader>
						<Card.CardContent>
							<Card.CardDescription class="text-base">
								{feature.description}
							</Card.CardDescription>
						</Card.CardContent>
					</Card.Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- How It Works Section -->
	<section class="py-20 bg-secondary/30">
		<div class="max-w-6xl mx-auto px-4">
			<div class="text-center mb-16">
				<Badge variant="secondary" class="mb-4">Simple Process</Badge>
				<h2 class="text-3xl sm:text-4xl font-bold mb-4">
					Start Journaling in 3 Easy Steps
				</h2>
			</div>
			
			<div class="grid md:grid-cols-3 gap-8">
				<div class="relative">
					<div class="flex flex-col items-center text-center">
						<div class="w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
							1
						</div>
						<h3 class="text-xl font-semibold mb-2">Write Your Thoughts</h3>
						<p class="text-muted-foreground">
							Express yourself freely. Use markdown, add photos, or record voice notes.
						</p>
					</div>
					{#if true}
						<div class="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-600 to-purple-600" aria-hidden="true"></div>
					{/if}
				</div>
				
				<div class="relative">
					<div class="flex flex-col items-center text-center">
						<div class="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
							2
						</div>
						<h3 class="text-xl font-semibold mb-2">Get AI Insights</h3>
						<p class="text-muted-foreground">
							Our AI analyzes your entry for sentiment, keywords, and emotional patterns.
						</p>
					</div>
					{#if true}
						<div class="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-600 to-pink-600" aria-hidden="true"></div>
					{/if}
				</div>
				
				<div>
					<div class="flex flex-col items-center text-center">
						<div class="w-16 h-16 rounded-full bg-gradient-to-r from-pink-600 to-pink-500 text-white flex items-center justify-center text-2xl font-bold mb-4">
							3
						</div>
						<h3 class="text-xl font-semibold mb-2">Track Your Growth</h3>
						<p class="text-muted-foreground">
							Visualize your progress, discover patterns, and celebrate your wellness journey.
						</p>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Testimonials Section -->
	<section class="py-20 bg-background">
		<div class="max-w-6xl mx-auto px-4">
			<div class="text-center mb-16">
				<Badge variant="secondary" class="mb-4">Testimonials</Badge>
				<h2 class="text-3xl sm:text-4xl font-bold mb-4">
					Loved by Mindful Journalers
				</h2>
			</div>
			
			<div class="grid md:grid-cols-3 gap-6">
				{#each testimonials as testimonial}
					<Card.Card class="bg-gradient-to-br from-background to-secondary/20">
						<Card.CardHeader>
							<div class="flex items-center gap-3">
								<div class="text-4xl">{testimonial.mood}</div>
								<div class="flex text-yellow-500">★★★★★</div>
							</div>
						</Card.CardHeader>
						<Card.CardContent>
							<p class="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>
							<p class="font-semibold">— {testimonial.author}</p>
						</Card.CardContent>
					</Card.Card>
				{/each}
			</div>
		</div>
	</section>

	<!-- CTA Section -->
	<section class="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
		<div class="max-w-4xl mx-auto px-4 text-center">
			<h2 class="text-3xl sm:text-5xl font-bold mb-6">
				Ready to Transform Your Wellness Journey?
			</h2>
			<p class="text-xl mb-8 text-blue-100">
				Join thousands of users who are discovering deeper insights about themselves every day.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if data.user}
					<Button href="/journal" size="lg" variant="secondary" class="text-lg px-8 py-6">
						Open Your Journal →
					</Button>
				{:else}
					<Button href="/auth/register" size="lg" variant="secondary" class="text-lg px-8 py-6">
						Start Free Today
					</Button>
					<Button href="#features" size="lg" variant="outline" class="text-lg px-8 py-6 border-white text-white hover:bg-white/10">
						Learn More
					</Button>
				{/if}
			</div>
			<p class="mt-6 text-sm text-blue-100">
				No credit card required • Free forever • Cancel anytime
			</p>
		</div>
	</section>

	<!-- Footer -->
	<footer class="bg-background border-t border-border py-12">
		<div class="max-w-6xl mx-auto px-4">
			<div class="grid md:grid-cols-4 gap-8">
				<div class="md:col-span-2">
					<h3 class="text-lg font-bold mb-4">Mood Journal</h3>
					<p class="text-muted-foreground mb-4">
						Your intelligent wellness companion for mindful journaling and emotional growth.
					</p>
					<div class="flex gap-4">
						<button type="button" class="text-muted-foreground hover:text-foreground transition-colors">Privacy</button>
						<button type="button" class="text-muted-foreground hover:text-foreground transition-colors">Terms</button>
						<button type="button" class="text-muted-foreground hover:text-foreground transition-colors">Contact</button>
					</div>
				</div>
				
				<div>
					<h4 class="font-semibold mb-4">Product</h4>
					<div class="space-y-2">
						<a href="/journal" class="block text-muted-foreground hover:text-foreground transition-colors">Journal</a>
						<a href="/journal/analytics" class="block text-muted-foreground hover:text-foreground transition-colors">Analytics</a>
						<a href="/journal/companion" class="block text-muted-foreground hover:text-foreground transition-colors">AI Companion</a>
						<a href="/journal/insights" class="block text-muted-foreground hover:text-foreground transition-colors">Insights</a>
					</div>
				</div>
				
				<div>
					<h4 class="font-semibold mb-4">Account</h4>
					<div class="space-y-2">
						{#if data.user}
							<a href="/account" class="block text-muted-foreground hover:text-foreground transition-colors">Settings</a>
							<a href="/auth/logout" class="block text-muted-foreground hover:text-foreground transition-colors">Sign Out</a>
						{:else}
							<a href="/auth/login" class="block text-muted-foreground hover:text-foreground transition-colors">Sign In</a>
							<a href="/auth/register" class="block text-muted-foreground hover:text-foreground transition-colors">Sign Up</a>
						{/if}
					</div>
				</div>
			</div>
			
			<div class="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
				<p>© {new Date().getFullYear()} Mood Journal. Built with ❤️ for mindful journaling.</p>
			</div>
		</div>
	</footer>
</div>

<style>
	.bg-grid-slate-900\/\[0\.04\] {
		background-image: linear-gradient(to right, rgb(15 23 42 / 0.04) 1px, transparent 1px),
			linear-gradient(to bottom, rgb(15 23 42 / 0.04) 1px, transparent 1px);
	}
</style>
