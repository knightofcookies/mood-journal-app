<!-- eslint-disable svelte/no-navigation-without-resolve -->
<script lang="ts">
	import { resolve } from '$app/paths';
	let email = '';
	let username = '';
	let password = '';

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

<h1 class="mb-4 text-xl font-semibold">Create your account</h1>

<form method="post" class="space-y-4">
	<div>
		<label for="username" class="block text-sm font-medium text-slate-700 dark:text-slate-200"
			>Username</label
		>
		<input
			id="username"
			name="username"
			bind:value={username}
			class="mt-1 block w-full rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:placeholder-slate-500"
		/>
	</div>
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
		class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 font-medium text-white shadow hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
		>Create account</button
	>

	<p class="text-center text-sm text-slate-600">
		Already have an account? <a
			href={resolve('/auth/login')}
			class="font-medium text-indigo-600 hover:text-indigo-700">Sign in</a
		>
	</p>
</form>
{#if form?.message}
	<div class="mt-3 text-sm text-red-600">{form.message}</div>
{/if}
