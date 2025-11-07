<script lang="ts">
	import { enhance } from '$app/forms';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { safeHtml } from '$lib/actions/safeHtml';

	let { data, form } = $props();

	let Purify: typeof DOMPurify | null = null;
	if (browser) {
		import('dompurify').then((m) => (Purify = m.default));
	}

	let editing = $state(false);
	let editContent = $state(data.entry.content);
	let uploading = $state(false);
	let deleting = $state(false);
	let dragOver = $state(false);


	function sanitize(html: string) {
		if (browser && Purify?.sanitize) {
			return Purify.sanitize(html, {
				ADD_TAGS: ['audio', 'source'],
				ADD_ATTR: ['controls', 'src']
			});
		}
		return html;
	}

	function processEntryHtml(html: string) {
		return html.replace(
			/<img([^>]+)>/g,
			'<img$1 class="max-w-full h-auto rounded border border-gray-200 dark:border-gray-700">'
		);
	}

	let previewHtml = $derived.by(() => {
		const html = sanitize(String(marked.parse(editing ? editContent : data.entry.content)));
		return processEntryHtml(html);
	});

	function formatDate(date: Date | string) {
		return new Date(date).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getSentimentEmoji(score: number): string {
		if (score > 50) return '😊';
		if (score > 0) return '🙂';
		if (score === 0) return '😐';
		if (score > -50) return '😟';
		return '😢';
	}

	// Editor helpers
	function getTA() {
		return document.getElementById('edit-content') as HTMLTextAreaElement | null;
	}

	function insertAtCursor(el: HTMLTextAreaElement, insertText: string) {
		const start = el.selectionStart || 0;
		const end = el.selectionEnd || 0;
		const before = el.value.substring(0, start);
		const after = el.value.substring(end);
		el.value = before + insertText + after;
		const pos = start + insertText.length;
		el.selectionStart = el.selectionEnd = pos;
		editContent = el.value;
		el.focus();
	}

	function wrapSelection(prefix: string, suffix: string = prefix) {
		const ta = getTA();
		if (!ta) return;
		const start = ta.selectionStart ?? 0;
		const end = ta.selectionEnd ?? 0;
		const selected = ta.value.slice(start, end);
		const hasSel = end > start;
		const inserted = hasSel ? `${prefix}${selected}${suffix}` : `${prefix}${suffix}`;
		const before = ta.value.slice(0, start);
		const after = ta.value.slice(end);
		ta.value = before + inserted + after;
		editContent = ta.value;
		ta.focus();
		if (hasSel) {
			ta.selectionStart = before.length + prefix.length;
			ta.selectionEnd = before.length + prefix.length + selected.length;
		} else {
			ta.selectionStart = ta.selectionEnd = before.length + prefix.length;
		}
	}

	function addLinePrefix(prefix: string) {
		const ta = getTA();
		if (!ta) return;
		const start = ta.selectionStart ?? 0;
		const end = ta.selectionEnd ?? 0;
		const before = ta.value.slice(0, start);
		const selected = ta.value.slice(start, end);
		const after = ta.value.slice(end);
		const lines = (selected || '').split('\n');
		const modified = (selected ? lines : ['']).map((l) => `${prefix}${l}`).join('\n');
		ta.value = before + modified + after;
		editContent = ta.value;
		const caret = (before + modified).length;
		ta.selectionStart = ta.selectionEnd = caret;
		ta.focus();
	}

	function insertCodeBlock() {
		const ta = getTA();
		if (!ta) return;
		const start = ta.selectionStart ?? 0;
		const end = ta.selectionEnd ?? 0;
		const selected = ta.value.slice(start, end) || 'code';
		const before = ta.value.slice(0, start);
		const after = ta.value.slice(end);
		const block = `\n\n\`\`\`\n${selected}\n\`\`\`\n\n`;
		ta.value = before + block + after;
		editContent = ta.value;
		const pos = (before + block).length;
		ta.selectionStart = ta.selectionEnd = pos;
		ta.focus();
	}

	function insertLink() {
		const ta = getTA();
		if (!ta) return;
		const start = ta.selectionStart ?? 0;
		const end = ta.selectionEnd ?? 0;
		const selected = ta.value.slice(start, end) || 'text';
		const before = ta.value.slice(0, start);
		const after = ta.value.slice(end);
		const snippet = `[${selected}](url)`;
		ta.value = before + snippet + after;
		editContent = ta.value;
		const urlStart = (before + `[${selected}](`).length;
		const urlEnd = urlStart + 3;
		ta.selectionStart = urlStart;
		ta.selectionEnd = urlEnd;
		ta.focus();
	}

	async function handleUpload(files: FileList | null) {
		if (!files || files.length === 0) return;
		uploading = true;
		const maxSize = 10 * 1024 * 1024;
		const fd = new FormData();
		for (const f of Array.from(files)) {
			if (f.size > maxSize) continue;
			fd.append('file', f);
		}
		try {
			const res = await fetch('/journal/upload', { method: 'POST', body: fd });
			if (!res.ok) throw new Error('upload failed');
			const body = await res.json();
			if (body?.files) {
				for (const f of body.files) {
					if (f.type && f.type.startsWith('image/')) {
						editContent += `\n\n![](${f.url})\n\n`;
					} else if (f.type && f.type.startsWith('audio/')) {
						editContent += `\n\n<audio controls src="${f.url}"></audio>\n\n`;
					} else {
						editContent += `\n\n[attachment](${f.url})\n\n`;
					}
				}
			}
		} catch (err) {
			console.error('upload error', err);
		} finally {
			uploading = false;
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (e.dataTransfer?.files) {
			handleUpload(e.dataTransfer.files);
		}
	}

	function cancelEdit() {
		editing = false;
		editContent = data.entry.content;
	}
</script>

<svelte:head>
	<title>Entry | Mood Journal</title>
</svelte:head>

<div class="bg-background min-h-screen">
	<div class="mx-auto max-w-4xl px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="mb-4 flex items-center justify-between">
				<a
					href="/journal"
					class="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
				>
					← Back to Journal
				</a>
				<div class="flex gap-2">
					{#if !editing}
						<button
							onclick={() => (editing = true)}
							class="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
						>
							Edit
						</button>
					{/if}
					<form
						method="POST"
						action="?/delete"
						use:enhance={() => {
							if (!confirm('Are you sure you want to delete this entry?')) {
								return async ({ update }) => {
									// Cancel the submission
								};
							}
							deleting = true;
							return async ({ update }) => {
								await update();
								deleting = false;
							};
						}}
					>
						<button
							type="submit"
							disabled={deleting}
							class="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
						>
							{deleting ? 'Deleting...' : 'Delete'}
						</button>
					</form>
				</div>
			</div>
		</div>

		{#if form?.error}
			<div class="mb-6 rounded-lg bg-red-50 p-4 text-red-600 dark:bg-red-900/20 dark:text-red-400">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div
				class="mb-6 rounded-lg bg-green-50 p-4 text-green-600 dark:bg-green-900/20 dark:text-green-400"
			>
				Entry updated successfully!
			</div>
		{/if}

		{#if editing}
			<!-- Edit Mode -->
			<form
				method="POST"
				action="?/update"
				use:enhance={() => {
					return async ({ result, update }) => {
						await update();
						if (result.type === 'success') {
							editing = false;
							data.entry.content = editContent;
						}
					};
				}}
			>
				<div class="mb-6 overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
					<!-- Editor Toolbar -->
					<div class="border-b border-gray-200 p-4 dark:border-gray-700">
						<div class="flex flex-wrap gap-2">
							<button
								type="button"
								onclick={() => wrapSelection('**')}
								class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
								title="Bold"
							>
								<strong>B</strong>
							</button>
							<button
								type="button"
								onclick={() => wrapSelection('*')}
								class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
								title="Italic"
							>
								<em>I</em>
							</button>
							<button
								type="button"
								onclick={() => addLinePrefix('# ')}
								class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
								title="Heading"
							>
								H1
							</button>
							<button
								type="button"
								onclick={() => addLinePrefix('- ')}
								class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
								title="List"
							>
								List
							</button>
							<button
								type="button"
								onclick={insertCodeBlock}
								class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
								title="Code Block"
							>
								Code
							</button>
							<button
								type="button"
								onclick={insertLink}
								class="rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
								title="Link"
							>
								Link
							</button>
							<label
								class="cursor-pointer rounded bg-gray-100 px-3 py-1 text-sm hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
								title="Upload"
							>
								📎
								<input
									type="file"
									class="hidden"
									multiple
									onchange={(e) => handleUpload(e.currentTarget.files)}
								/>
							</label>
						</div>
					</div>

					<!-- Editor -->
					<div
						role="button"
						tabindex="0"
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
						ondrop={handleDrop}
						class="relative {dragOver ? 'bg-gray-100 dark:bg-gray-800' : ''}"
					>
						<textarea
							id="edit-content"
							name="content"
							bind:value={editContent}
							placeholder="Write your entry..."
							class="min-h-[400px] w-full resize-none bg-transparent p-6 text-gray-900 placeholder-gray-400 focus:outline-none dark:text-white"
							required
						></textarea>
						{#if uploading}
							<div
								class="bg-gray-1000 absolute top-4 right-4 rounded-full px-3 py-1 text-sm text-white"
							>
								Uploading...
							</div>
						{/if}
					</div>
				</div>

				<div class="flex gap-4">
					<button
						type="submit"
						class="rounded-lg bg-gray-900 px-6 py-3 font-semibold text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
					>
						Save Changes
					</button>
					<button
						type="button"
						onclick={cancelEdit}
						class="rounded-lg bg-gray-200 px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
					>
						Cancel
					</button>
				</div>
			</form>
		{:else}
			<!-- View Mode -->
			<article class="overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-800">
				<!-- Entry Header -->
				<div class="border-b border-gray-200 p-6 dark:border-gray-700">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<div>
								<p class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
									<span>{formatDate(data.entry.createdAt)}</span>
									{#if data.entry.sentimentScore !== null && data.entry.sentimentScore !== undefined}
										<span
											class="flex items-center gap-1"
											title="Sentiment: {data.entry.sentimentLabel} ({data.entry.sentimentScore > 0
												? '+'
												: ''}{data.entry.sentimentScore})"
										>
											<span class="text-lg">{getSentimentEmoji(data.entry.sentimentScore)}</span>
											<span class="text-xs text-gray-500 dark:text-gray-500">
												{data.entry.sentimentLabel?.toLowerCase()}
											</span>
										</span>
									{/if}
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Entry Content -->
				<div class="p-6 sm:p-8">
					<div
						class="prose max-w-none prose-slate dark:prose-invert
						prose-headings:text-gray-900 dark:prose-headings:text-white
						prose-p:text-gray-700 dark:prose-p:text-gray-300
						prose-a:text-gray-600 dark:prose-a:text-gray-400
						prose-code:text-pink-600 dark:prose-code:text-pink-400
						prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900
						prose-img:rounded-lg prose-img:shadow-md"
						use:safeHtml={previewHtml}
					>
					</div>
				</div>

				<!-- Tags Section -->
				{#if data.entry.tags && data.entry.tags.length > 0}
					<div class="border-t border-gray-200 p-6 dark:border-gray-700">
						<h3 class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Tags</h3>
						<div class="flex flex-wrap gap-2">
							{#each data.entry.tags as tag}
								<span
									class="inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm {tag.type ===
									'keyword'
										? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
										: 'border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400'}"
								>
									{#if tag.type === 'entity'}
										<span>👤</span>
									{/if}
									<span>{tag.name}</span>
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</article>
		{/if}
	</div>
</div>
