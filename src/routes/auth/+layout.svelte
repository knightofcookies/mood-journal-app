<script lang="ts">
	let { children } = $props();
	// Simple, centered auth layout
	const year = new Date().getFullYear();
	const appName = 'Mood Journal';
	const description = 'A privacy-first journaling app';
	const footer = `${appName} \u00B7 ${year}`;
</script>

<div
	class="flex min-h-screen items-center justify-center bg-background px-4"
>
	<div class="w-full max-w-md">
		<div class="mb-6 text-center">
			<h1 class="text-3xl font-semibold tracking-tight">{appName}</h1>
			<p class="mt-1 text-sm text-muted-foreground">{description}</p>
		</div>

		<main
			class="rounded-xl border border-border bg-card p-6 shadow-sm"
		>
			{@render children?.()}
		</main>

		<p class="mt-6 text-center text-xs text-muted-foreground">{footer}</p>
	</div>
</div>
