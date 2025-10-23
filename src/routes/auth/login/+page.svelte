<script lang="ts">
	let email = '';
	let password = '';

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

<h1 class="mb-4 text-xl font-semibold">Welcome back</h1>

<form method="post" class="space-y-4">
	<div>
		<label for="email" class="block text-sm font-medium text-slate-700 dark:text-slate-200"
			>Email</label
		>
		<input
			id="email"
			name="email"
			type="email"
			bind:value={email}
			class="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder-slate-500"
		/>
	</div>
	<div>
		<label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-200"
			>Password</label
		>
		<input
			id="password"
			name="password"
			type="password"
			bind:value={password}
			class="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder-slate-500"
		/>
	</div>

	<button
		class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
		>Sign in</button
	>

	<p class="text-center text-sm text-slate-600">
		Don't have an account? <a
			href="/auth/register"
			class="font-medium text-indigo-600 hover:text-indigo-700">Create one</a
		>
	</p>
</form>
{#if form?.message}
	<div class="mt-3 text-sm text-red-600">{form.message}</div>
{/if}
