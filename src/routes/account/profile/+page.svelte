<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import * as Alert from '$lib/components/ui/alert';

	let { data } = $props();
	let username = $state(data.user?.username ?? '');
	let message = $state('');
	let avatarUploading = $state(false);
	let fileInput: HTMLInputElement;

	// Debug: Check what data we have
	$effect(() => {
		console.log('Profile data:', data);
		console.log('Linked accounts:', data.linkedAccounts);
	});

	const handleSubmit = (args: unknown) => {
		const result = (args as { result?: { type: 'success' | 'failure'; data?: unknown } }).result;
		if (!result) return;
		if (result.type === 'success') {
			message = 'Saved';
		} else if (result.type === 'failure') {
			message = ((result.data as Record<string, unknown>)?.['message'] as string) || 'Save failed';
		} else {
			message = 'Save failed';
		}
		return;
	};

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

			if (!res.ok) {
				message = 'Upload failed';
				return;
			}

			const body = await res.json();
			console.log('Avatar upload response:', body);

			// SvelteKit wraps the action result, and the data might be double-encoded
			if (body.type === 'success') {
				let data = body.data;

				// If data is a string, parse it
				if (typeof data === 'string') {
					try {
						data = JSON.parse(data);
					} catch {
						// Not JSON, use as is
					}
				}

				// Handle array format: [{"ok":1,"url":2}, true, "/uploads/..."]
				if (Array.isArray(data) && data.length >= 3) {
					const url = data[2]; // The URL is the third element
					if (url && typeof url === 'string') {
						// refresh displayed avatar
						const img = document.getElementById('avatar-img') as HTMLImageElement | null;
						if (img) img.src = url + '?t=' + Date.now();
						message = 'Avatar updated';
						await invalidateAll(); // Invalidate all data to update navbar
					} else {
						message = 'Upload failed';
					}
				} else if (data?.ok && data?.url) {
					// Handle object format: { ok: true, url: "/uploads/..." }
					const url = data.url;
					const img = document.getElementById('avatar-img') as HTMLImageElement | null;
					if (img) img.src = url + '?t=' + Date.now();
					message = 'Avatar updated';
					await invalidateAll(); // Invalidate all data to update navbar
				} else {
					message = 'Upload failed';
				}
			} else if (body.type === 'failure') {
				message = body.data?.message || 'Upload failed';
			} else {
				message = 'Upload failed';
			}
		} catch (error) {
			console.error('Avatar upload error:', error);
			message = 'Upload failed';
		} finally {
			avatarUploading = false;
			input.value = '';
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Profile Settings</Card.Title>
		<Card.Description>Manage your account information</Card.Description>
	</Card.Header>
	<Card.Content class="space-y-6">
		{#if message}
			<Alert.Root>
				<Alert.Description>{message}</Alert.Description>
			</Alert.Root>
		{/if}

		<div class="flex items-center gap-4">
			{#if data.user?.avatarUrl}
				<img
					id="avatar-img"
					src={data.user.avatarUrl}
					alt="avatar"
					class="h-16 w-16 rounded-full object-cover"
				/>
			{:else}
				<div
					id="avatar-img"
					class="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full text-xl font-semibold"
				>
					{data.user?.username?.slice(0, 2)?.toUpperCase()}
				</div>
			{/if}
			<div>
				<input
					type="file"
					class="hidden"
					accept="image/png,image/jpeg"
					onchange={onAvatarChange}
					bind:this={fileInput}
				/>
				<Button
					variant="outline"
					type="button"
					disabled={avatarUploading}
					onclick={() => fileInput?.click()}
				>
					{avatarUploading ? 'Uploading…' : 'Change avatar'}
				</Button>
			</div>
		</div>

		<!-- Linked Accounts Section -->
		<div class="border-t pt-4">
			<h3 class="mb-3 text-sm font-semibold">Linked Accounts</h3>
			{#if data.linkedAccounts && data.linkedAccounts.length > 0}
				<div class="space-y-2">
					{#each data.linkedAccounts as account (account.provider)}
						<div class="bg-muted/50 flex items-center gap-3 rounded-lg border px-3 py-2">
							<div class="bg-background flex h-8 w-8 items-center justify-center rounded-full">
								{#if account.provider === 'google'}
									<svg class="h-5 w-5" viewBox="0 0 24 24">
										<path
											fill="#4285F4"
											d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
										/>
										<path
											fill="#34A853"
											d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
										/>
										<path
											fill="#FBBC05"
											d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
										/>
										<path
											fill="#EA4335"
											d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
										/>
									</svg>
								{:else}
									<span class="text-xs font-medium">
										{account.provider.slice(0, 2).toUpperCase()}
									</span>
								{/if}
							</div>
							<div class="flex-1">
								<p class="text-sm font-medium capitalize">
									{account.provider}
								</p>
								<p class="text-muted-foreground text-xs">
									{data.user?.email}
								</p>
							</div>
							<Badge variant="secondary">Connected</Badge>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-muted-foreground text-sm">No linked accounts found.</p>
			{/if}
		</div>

		<form
			class="grid gap-4 border-t pt-4"
			method="POST"
			action="?/update"
			use:enhance={handleSubmit}
		>
			<div class="space-y-2">
				<Label for="username">Username</Label>
				<Input id="username" name="username" bind:value={username} />
			</div>
			<div>
				<Button type="submit">Save changes</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>
