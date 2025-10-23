<script lang="ts">
	let message = $state('');
	async function onSubmit(e: SubmitEvent) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget as HTMLFormElement);
		const res = await fetch('?/change_password', {
			method: 'POST',
			body: fd,
			headers: { Accept: 'application/json' }
		});
		const body = await res.json();
		message = body?.ok ? 'Password updated' : body?.message || 'Update failed';
		(e.currentTarget as HTMLFormElement).reset();
	}
</script>

<div
	class="space-y-6 rounded-xl border border-slate-200 bg-white/70 p-4 dark:border-slate-700 dark:bg-slate-800/40"
>
	{#if message}
		<div
			class="rounded-md border border-emerald-200/80 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
		>
			{message}
		</div>
	{/if}

	<form class="grid max-w-md gap-3" onsubmit={onSubmit}>
		<div>
			<label for="current_password" class="mb-1 block text-sm font-medium">Current password</label>
			<input
				id="current_password"
				type="password"
				name="current_password"
				class="w-full rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/40"
				required
			/>
		</div>
		<div>
			<label for="new_password" class="mb-1 block text-sm font-medium">New password</label>
			<input
				id="new_password"
				type="password"
				name="new_password"
				minlength="8"
				class="w-full rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/40"
				required
			/>
			<p class="mt-1 text-xs text-slate-500">Must be at least 8 characters.</p>
		</div>
		<div>
			<button
				type="submit"
				class="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700"
				>Update password</button
			>
		</div>
	</form>
</div>
