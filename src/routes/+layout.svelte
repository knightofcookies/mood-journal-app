<!-- eslint-disable svelte/no-navigation-without-resolve -->
<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Button } from '$lib/components/ui/button';
	import { resolve } from '$app/paths';
	import { page } from '$app/stores';
	import InstallPrompt from '$lib/components/InstallPrompt.svelte';
	import AchievementToast from '$lib/components/AchievementToast.svelte';
	import { achievementNotifications } from '$lib/stores/achievements';
	import ThemeToggle from '$lib/ThemeToggle.svelte';

	let { children, data } = $props();

	const isJournalActive = $derived($page.url.pathname.startsWith('/journal') && !$page.url.pathname.includes('/analytics') && !$page.url.pathname.includes('/companion') && !$page.url.pathname.includes('/wellness'));
	const isAnalyticsActive = $derived($page.url.pathname.includes('/analytics'));
	const isWellnessActive = $derived($page.url.pathname.includes('/wellness'));
	const isAIActive = $derived($page.url.pathname.includes('/companion'));
	const isAccountActive = $derived($page.url.pathname.startsWith('/account'));
	const isAchievementsActive = $derived($page.url.pathname.startsWith('/achievements'));
	const isHome = $derived($page.url.pathname === '/');

	let sidebarCollapsed = $state(false);

	const navItems = [
		{
			label: 'Journal',
			icon: '📝',
			href: '/journal',
			get active() { return isJournalActive; }
		},
		{
			label: 'Analytics',
			icon: '📊',
			href: '/journal/analytics',
			get active() { return isAnalyticsActive; }
		},
		{
			label: 'Wellness',
			icon: '🧘',
			href: '/wellness',
			get active() { return isWellnessActive; }
		},
		{
			label: 'AI Companion',
			icon: '🤖',
			href: '/journal/companion',
			get active() { return isAIActive; }
		},
		{
			label: 'Achievements',
			icon: '🏆',
			href: '/achievements',
			get active() { return isAchievementsActive; }
		}
	];

	function initials(name: string) {
		if (!name) return '?';
		const parts = name.trim().split(/\s+/);
		const [a, b] = [parts[0]?.[0] ?? '', parts[1]?.[0] ?? ''];
		return (a + b).toUpperCase() || name[0]?.toUpperCase() || '?';
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<InstallPrompt />
{#each $achievementNotifications as achievement}
	<AchievementToast {achievement} />
{/each}

<!-- Modern Premium Layout -->
{#if data?.user && !isHome}
	<div class="flex h-screen overflow-hidden bg-background text-foreground">
		<!-- Enhanced Sidebar with gradient accent -->
		<aside
			class="flex flex-col border-r border-border bg-gradient-to-b from-card to-background transition-all duration-300 ease-in-out {sidebarCollapsed ? 'w-20' : 'w-64'} relative"
		>
			<!-- Decorative gradient bar -->
			<div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>
			
			<!-- Sidebar Header -->
			<div class="flex h-14 items-center justify-between border-b border-border/50 px-4 backdrop-blur-sm">
				{#if !sidebarCollapsed}
					<a href={resolve('/')} class="flex items-center gap-3 text-sm font-bold group">
						<span class="text-2xl transform transition-transform group-hover:scale-110 group-hover:rotate-12">📔</span>
						<span class="gradient-text">Mood Journal</span>
					</a>
				{:else}
					<a href={resolve('/')} class="flex items-center justify-center w-full group">
						<span class="text-2xl transform transition-transform group-hover:scale-125 group-hover:rotate-12">📔</span>
					</a>
				{/if}
				<button
					onclick={() => sidebarCollapsed = !sidebarCollapsed}
					class="rounded-lg p-2 hover:bg-accent/80 transition-all duration-200 hover:scale-110 active:scale-95"
					aria-label="Toggle sidebar"
				>
					<svg class="w-4 h-4 transition-transform" class:rotate-180={sidebarCollapsed} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>

			<!-- Navigation Items -->
			<nav class="flex-1 overflow-y-auto p-3 space-y-1">
				{#each navItems as item, index}
					<a
						href={item.href}
						class="sidebar-item fade-in group {item.active ? 'active' : ''}"
						style="animation-delay: {index * 50}ms"
						title={item.label}
					>
						<span class="text-xl transition-transform group-hover:scale-125">{item.icon}</span>
						{#if !sidebarCollapsed}
							<span class="flex-1 font-medium">{item.label}</span>
							{#if item.active}
								<div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
							{/if}
						{/if}
					</a>
				{/each}

				{#if !sidebarCollapsed}
					<div class="mt-8 px-2 space-y-1">
						<div class="flex items-center gap-2 px-2 mb-3">
							<div class="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"></div>
							<span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Quick Actions</span>
							<div class="h-px flex-1 bg-gradient-to-r from-border via-transparent to-transparent"></div>
						</div>
						<a
							href="/journal/new"
							class="sidebar-item group hover:bg-gradient-to-r hover:from-green-500/10 hover:to-transparent"
						>
							<span class="text-xl transition-transform group-hover:scale-125">✍️</span>
							<span class="flex-1 font-medium">New Entry</span>
							<span class="text-xs text-muted-foreground group-hover:text-green-500 transition-colors">⌘N</span>
						</a>
						<a
							href="/journal/search"
							class="sidebar-item group hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-transparent"
						>
							<span class="text-xl transition-transform group-hover:scale-125">🔍</span>
							<span class="flex-1 font-medium">Search</span>
							<span class="text-xs text-muted-foreground group-hover:text-blue-500 transition-colors">⌘K</span>
						</a>
					</div>
				{/if}
			</nav>

			<!-- Sidebar Footer -->
			<div class="border-t border-border/50 p-3 space-y-2 backdrop-blur-sm bg-card/50">
				<div class="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent/50 transition-all group">
					{#if !sidebarCollapsed}
						<span class="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Theme</span>
					{/if}
					<ThemeToggle />
				</div>
				<a
					href={resolve('/account/profile')}
					class="sidebar-item {isAccountActive ? 'active' : ''} group"
					title={data.user.username}
				>
					{#if data.user.avatarUrl}
						<div class="relative">
							<img
								src={data.user.avatarUrl}
								alt="avatar"
								class="h-8 w-8 rounded-full object-cover ring-2 ring-primary/20 transition-all group-hover:ring-primary/50 group-hover:scale-110"
							/>
							<div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-card"></div>
						</div>
					{:else}
						<div
							class="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ring-2 ring-primary/20 transition-all group-hover:ring-primary/50 group-hover:scale-110 shadow-lg"
						>
							{initials(data.user.username)}
						</div>
					{/if}
					{#if !sidebarCollapsed}
						<span class="flex-1 truncate font-semibold">{data.user.username}</span>
						<svg class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
						</svg>
					{/if}
				</a>
				{#if !sidebarCollapsed}
					<form method="post" action="/auth/logout">
						<button
							type="submit"
							class="sidebar-item w-full text-destructive hover:bg-destructive/10 group"
						>
							<span class="text-lg transition-transform group-hover:scale-110">🚪</span>
							<span class="flex-1 text-left font-medium">Logout</span>
							<svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7" />
							</svg>
						</button>
					</form>
				{/if}
			</div>
		</aside>

		<!-- Main Content Area with subtle gradient background -->
		<main class="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background to-accent/5">
			<div class="fade-in">
				{@render children?.()}
			</div>
		</main>
	</div>
{:else}
	<!-- Landing page or auth pages without sidebar -->
	<div class="bg-background text-foreground min-h-screen">
		{@render children?.()}
	</div>
{/if}
