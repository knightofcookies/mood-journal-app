<script lang="ts">
	import { enhance } from '$app/forms';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	let { data, form } = $props();

	let Purify: typeof DOMPurify | null = null;
	if (browser) {
		import('dompurify').then((m) => (Purify = m.default));
	}

	let editing = $state(false);
	let editContent = $state(data.entry.content);
	let editMood = $state(data.entry.mood);
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

	function getMoodEmoji(mood: string) {
		const emojis: Record<string, string> = {
			happy: '😊',
			neutral: '😐',
			sad: '😢',
			anxious: '😰',
			excited: '🤩'
		};
		return emojis[mood] || '😐';
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
		editMood = data.entry.mood;
	}
</script>

<svelte:head>
	<title>Entry | Mood Journal</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="max-w-4xl mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between mb-4">
				<a href="/journal" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
					← Back to Journal
				</a>
				<div class="flex gap-2">
					{#if !editing}
						<button
							onclick={() => (editing = true)}
							class="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
						>
							Edit
						</button>
					{/if}
					<form method="POST" action="?/delete" use:enhance={() => {
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
					}}>
						<button
							type="submit"
							disabled={deleting}
							class="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
						>
							{deleting ? 'Deleting...' : 'Delete'}
						</button>
					</form>
				</div>
			</div>
		</div>

		{#if form?.error}
			<div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
				Entry updated successfully!
			</div>
		{/if}

		{#if editing}
			<!-- Edit Mode -->
			<form method="POST" action="?/update" use:enhance={() => {
				return async ({ result, update }) => {
					await update();
					if (result.type === 'success') {
						editing = false;
						data.entry.content = editContent;
						data.entry.mood = editMood;
					}
				};
			}}>
				<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
					<!-- Mood Selector -->
					<div class="p-6 border-b border-gray-200 dark:border-gray-700">
						<div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
							Mood
						</div>
						<div class="flex gap-3">
							{#each ['happy', 'neutral', 'sad', 'anxious', 'excited'] as m}
								<button
									type="button"
									onclick={() => (editMood = m)}
									class="flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all {editMood === m
										? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-800'
										: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
								>
									<span class="text-2xl">{getMoodEmoji(m)}</span>
									<span class="text-xs font-medium capitalize">{m}</span>
								</button>
							{/each}
						</div>
						<input type="hidden" name="mood" value={editMood} />
					</div>

					<!-- Editor Toolbar -->
					<div class="border-b border-gray-200 dark:border-gray-700 p-4">
						<div class="flex flex-wrap gap-2">
							<button type="button" onclick={() => wrapSelection('**')} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="Bold">
								<strong>B</strong>
							</button>
							<button type="button" onclick={() => wrapSelection('*')} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="Italic">
								<em>I</em>
							</button>
							<button type="button" onclick={() => addLinePrefix('# ')} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="Heading">
								H1
							</button>
							<button type="button" onclick={() => addLinePrefix('- ')} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="List">
								List
							</button>
							<button type="button" onclick={insertCodeBlock} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="Code Block">
								Code
							</button>
							<button type="button" onclick={insertLink} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="Link">
								Link
							</button>
							<label class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer" title="Upload">
								📎
								<input type="file" class="hidden" multiple onchange={(e) => handleUpload(e.currentTarget.files)} />
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
							class="w-full min-h-[400px] p-6 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none"
							required
						></textarea>
						{#if uploading}
							<div class="absolute top-4 right-4 px-3 py-1 bg-gray-1000 text-white rounded-full text-sm">
								Uploading...
							</div>
						{/if}
					</div>
				</div>

				<div class="flex gap-4">
					<button
						type="submit"
						class="px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors"
					>
						Save Changes
					</button>
					<button
						type="button"
						onclick={cancelEdit}
						class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
					>
						Cancel
					</button>
				</div>
			</form>
		{:else}
			<!-- View Mode -->
			<article class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
				<!-- Entry Header -->
				<div class="p-6 border-b border-gray-200 dark:border-gray-700">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<span class="text-4xl">{getMoodEmoji(data.entry.mood)}</span>
							<div>
								<h1 class="text-2xl font-bold text-gray-900 dark:text-white capitalize">
									{data.entry.mood}
								</h1>
								<p class="text-sm text-gray-600 dark:text-gray-400">
									{formatDate(data.entry.createdAt)}
								</p>
								{#if data.entry.updatedAt && data.entry.updatedAt !== data.entry.createdAt}
									<p class="text-xs text-gray-500 dark:text-gray-500">
										Updated: {formatDate(data.entry.updatedAt)}
									</p>
								{/if}
							</div>
						</div>
					</div>
				</div>

				<!-- Entry Content -->
				<div class="p-6 sm:p-8">
					<div class="prose prose-slate dark:prose-invert max-w-none
						prose-headings:text-gray-900 dark:prose-headings:text-white
						prose-p:text-gray-700 dark:prose-p:text-gray-300
						prose-a:text-gray-600 dark:prose-a:text-gray-400
						prose-code:text-pink-600 dark:prose-code:text-pink-400
						prose-pre:bg-gray-100 dark:prose-pre:bg-gray-900
						prose-img:rounded-lg prose-img:shadow-md">
						{@html previewHtml}
					</div>
				</div>
			</article>
		{/if}
	</div>
</div>
