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

<!-- Notion-like Layout -->
{#if data?.user && !isHome}
	<div class="flex h-screen overflow-hidden bg-background text-foreground">
		<!-- Sidebar -->
		<aside
			class="flex w-60 flex-col border-r border-border bg-background transition-all duration-200 {sidebarCollapsed ? 'w-16' : 'w-60'}"
		>
			<!-- Sidebar Header -->
			<div class="flex h-12 items-center justify-between border-b border-border px-3">
				{#if !sidebarCollapsed}
					<a href={resolve('/')} class="flex items-center gap-2 text-sm font-semibold">
						<span class="text-lg">📔</span>
						<span>Mood Journal</span>
					</a>
				{:else}
					<a href={resolve('/')} class="flex items-center justify-center w-full">
						<span class="text-lg">📔</span>
					</a>
				{/if}
				<button
					onclick={() => sidebarCollapsed = !sidebarCollapsed}
					class="rounded p-1 hover:bg-accent transition-colors"
					aria-label="Toggle sidebar"
				>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
					</svg>
				</button>
			</div>

			<!-- Navigation Items -->
			<nav class="flex-1 overflow-y-auto p-2">
				<div class="space-y-1">
					{#each navItems as item}
						<a
							href={item.href}
							class="sidebar-item {item.active ? 'active bg-accent text-foreground' : ''}"
							title={item.label}
						>
							<span class="text-lg">{item.icon}</span>
							{#if !sidebarCollapsed}
								<span class="flex-1">{item.label}</span>
							{/if}
						</a>
					{/each}
				</div>

				{#if !sidebarCollapsed}
					<div class="mt-6 px-2">
						<div class="text-xs font-semibold text-muted-foreground mb-2">Quick Actions</div>
						<a
							href="/journal/new"
							class="sidebar-item"
						>
							<span class="text-lg">✍️</span>
							<span class="flex-1">New Entry</span>
						</a>
						<a
							href="/journal/search"
							class="sidebar-item"
						>
							<span class="text-lg">🔍</span>
							<span class="flex-1">Search</span>
						</a>
					</div>
				{/if}
			</nav>

			<!-- Sidebar Footer -->
			<div class="border-t border-border p-2">
				<div class="flex items-center justify-between px-2 py-1.5 mb-1">
					{#if !sidebarCollapsed}
						<span class="text-xs font-medium text-muted-foreground">Theme</span>
					{/if}
					<ThemeToggle />
				</div>
				<a
					href={resolve('/account/profile')}
					class="sidebar-item {isAccountActive ? 'active' : ''}"
					title={data.user.username}
				>
					{#if data.user.avatarUrl}
						<img
							src={data.user.avatarUrl}
							alt="avatar"
							class="h-6 w-6 rounded-full object-cover"
						/>
					{:else}
						<div
							class="bg-primary text-primary-foreground flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold"
						>
							{initials(data.user.username)}
						</div>
					{/if}
					{#if !sidebarCollapsed}
						<span class="flex-1 truncate">{data.user.username}</span>
					{/if}
				</a>
				{#if !sidebarCollapsed}
					<form method="post" action="/auth/logout" class="mt-1">
						<button
							type="submit"
							class="sidebar-item w-full text-destructive hover:bg-destructive/10"
						>
							<span class="text-lg">🚪</span>
							<span class="flex-1 text-left">Logout</span>
						</button>
					</form>
				{/if}
			</div>
		</aside>

		<!-- Main Content Area -->
		<main class="flex-1 overflow-y-auto">
			{@render children?.()}
		</main>
	</div>
{:else}
	<!-- Landing page or auth pages without sidebar -->
	<div class="bg-background text-foreground min-h-screen">
		{@render children?.()}
	</div>
{/if}
