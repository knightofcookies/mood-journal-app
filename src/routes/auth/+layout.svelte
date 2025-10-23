<script lang="ts">
	let { children } = $props();
	// Simple, centered auth layout
	const year = new Date().getFullYear();
	const appName = 'Mood Journal';
	const description = 'A privacy-first journaling app';
	const footer = `${appName} \u00B7 ${year}`;
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 dark:from-slate-950 dark:to-slate-900"
>
	<div class="w-full max-w-md">
		<div class="mb-6 text-center">
			<h1 class="text-3xl font-semibold tracking-tight">{appName}</h1>
			<p class="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
		</div>

		<main
			class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800/50"
		>
			{@render children?.()}
		</main>

		<p class="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">{footer}</p>
	</div>
</div>
