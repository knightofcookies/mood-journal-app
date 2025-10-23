<script lang="ts">
	let { data } = $props();
	let username = $state(data.user?.username ?? '');
	let email = $state(data.user?.email ?? '');
	let message = $state('');
	let avatarUploading = $state(false);

	async function submitProfile(e: SubmitEvent) {
		e.preventDefault();
		const fd = new FormData(e.currentTarget as HTMLFormElement);
		const res = await fetch('?/update', {
			method: 'POST',
			body: fd,
			headers: { Accept: 'application/json' }
		});
		const body = await res.json();
		message = body?.ok ? 'Saved' : body?.message || 'Save failed';
	}

	async function onAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const fd = new FormData();
		fd.append('avatar', file);
		avatarUploading = true;
		try {
			const res = await fetch('?/avatar', {
				method: 'POST',
				body: fd,
				headers: { Accept: 'application/json' }
			});
			const body = await res.json();
			if (body?.ok && body.url) {
				// refresh displayed avatar
				const img = document.getElementById('avatar-img') as HTMLImageElement | null;
				if (img) img.src = body.url + '?t=' + Date.now();
				message = 'Avatar updated';
			} else {
				message = body?.message || 'Upload failed';
			}
		} finally {
			avatarUploading = false;
			input.value = '';
		}
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

	<div class="flex items-center gap-4">
		{#if data.user?.avatar_url}
			<img
				id="avatar-img"
				src={data.user.avatar_url}
				alt="avatar"
				class="h-16 w-16 rounded-full object-cover"
			/>
		{:else}
			<div
				id="avatar-img"
				class="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-600 text-xl font-semibold text-white"
			>
				{data.user?.username?.slice(0, 2)?.toUpperCase()}
			</div>
		{/if}
		<label
			class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:bg-slate-800"
		>
			<input type="file" class="hidden" accept="image/png,image/jpeg" onchange={onAvatarChange} />
			<span>{avatarUploading ? 'Uploading…' : 'Change avatar'}</span>
		</label>
	</div>

	<form class="grid gap-3" onsubmit={submitProfile}>
		<div>
			<label for="username" class="mb-1 block text-sm font-medium">Username</label>
			<input
				id="username"
				name="username"
				bind:value={username}
				class="w-full rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/40"
			/>
		</div>
		<div>
			<label for="email" class="mb-1 block text-sm font-medium">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				bind:value={email}
				class="w-full rounded-md border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-900/40"
			/>
		</div>
		<div>
			<button
				type="submit"
				class="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white shadow hover:bg-indigo-700"
				>Save changes</button
			>
		</div>
	</form>
</div>
