<script lang="ts">
	let { class: klass = '' } = $props();
	let isDark = $state(false);

	function apply(dark: boolean) {
		const root = document.documentElement.classList;
		root.toggle('dark', dark);
		try {
			localStorage.setItem('theme', dark ? 'dark' : 'light');
		} catch {}
	}

	if (typeof window !== 'undefined') {
		// initialize from current class or media
		const saved = localStorage.getItem('theme');
		const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		isDark = saved
			? saved === 'dark'
			: document.documentElement.classList.contains('dark') || preferDark;
	}

	function toggle() {
		isDark = !isDark;
		apply(isDark);
	}
</script>

<button
	type="button"
	onclick={toggle}
	class={`inline-flex items-center gap-2 rounded-md border bg-white/70 px-2 py-1 text-sm hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 ${klass}`}
	aria-label="Toggle theme"
>
	{#if isDark}
		<span>🌙</span><span>Dark</span>
	{:else}
		<span>☀️</span><span>Light</span>
	{/if}
</button>
