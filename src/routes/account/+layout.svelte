<!-- eslint-disable svelte/no-navigation-without-resolve -->
<script lang="ts">
	import { resolve } from '$app/paths';
	let { children } = $props();
</script>

<main class="px-4 py-6 md:px-6">
	<div class="mx-auto max-w-4xl">
		<h1 class="mb-4 text-2xl font-semibold tracking-tight">Account settings</h1>

		<nav class="mb-6 flex gap-2 text-sm">
			<a
				href={resolve('/account/profile')}
				class="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
				>Profile</a
			>
			<a
				href={resolve('/account/ai')}
				class="rounded-md border border-slate-300 px-3 py-1.5 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
				>AI Companion</a
			>
		</nav>
		{@render children?.()}
	</div>
</main>
