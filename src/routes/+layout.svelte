<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();

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

<div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
	<header
		class="sticky top-0 z-10 border-b border-slate-200/70 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-slate-800 dark:supports-[backdrop-filter]:bg-slate-900/60"
	>
		<div class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
			<a href="/" class="text-xl font-semibold tracking-tight md:text-2xl">Mood Journal</a>
			<nav class="flex items-center gap-3">
				{#if data?.user}
					<details class="relative">
						<summary
							class="flex cursor-pointer list-none items-center gap-2 rounded-full px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
						>
							{#if data.user.avatar_url}
								<img
									src={data.user.avatar_url}
									alt="avatar"
									class="h-8 w-8 rounded-full object-cover"
								/>
							{:else}
								<div
									class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white"
								>
									{initials(data.user.username)}
								</div>
							{/if}
							<span class="hidden text-sm sm:inline">{data.user.username}</span>
						</summary>
						<div
							class="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900"
						>
							<a
								href="/journal"
								class="block rounded px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
								>Journal</a
							>
							<a
								href="/account/profile"
								class="block rounded px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
								>Account settings</a
							>
							<form method="post" action="/auth/logout">
								<button
									type="submit"
									class="w-full rounded px-3 py-2 text-left text-sm text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800"
									>Logout</button
								>
							</form>
						</div>
					</details>
				{:else}
					<a
						href="/auth/login"
						class="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
						>Log in</a
					>
					<a
						href="/auth/register"
						class="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
						>Sign up</a
					>
				{/if}
			</nav>
		</div>
	</header>
	{@render children?.()}
</div>
