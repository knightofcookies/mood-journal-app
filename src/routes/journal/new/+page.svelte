<script lang="ts">
	import { enhance } from '$app/forms';
	import { marked } from 'marked';
	import DOMPurify from 'dompurify';
	import { browser } from '$app/environment';
	import TemplateSelector from '$lib/components/TemplateSelector.svelte';

	let { data, form } = $props();

	let Purify: typeof DOMPurify | null = null;
	if (browser) {
		import('dompurify').then((m) => (Purify = m.default));
	}

	// Form state
	let content = $state('');
	let mood = $state('neutral');
	let attachments = $state<Array<{ url: string; type: string }>>([]);
	let uploading = $state(false);
	let submitting = $state(false);
	let dragOver = $state(false);

	// Autosave functionality
	const AUTOSAVE_KEY = 'journal-draft';
	function saveDraft() {
		if (browser) {
			localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ content, mood, timestamp: Date.now() }));
		}
	}
	function loadDraft() {
		if (browser) {
			try {
				const saved = localStorage.getItem(AUTOSAVE_KEY);
				if (saved) {
					const draft = JSON.parse(saved);
					// Only restore if it's recent (within 24 hours)
					if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
						content = draft.content || '';
						mood = draft.mood || 'neutral';
					} else {
						localStorage.removeItem(AUTOSAVE_KEY);
					}
				}
			} catch (e) {
				console.error('Failed to load draft', e);
			}
		}
	}
	function clearDraft() {
		if (browser) {
			localStorage.removeItem(AUTOSAVE_KEY);
		}
	}

	// Load draft on mount
	if (browser) {
		loadDraft();
	}

	// Autosave on changes
	$effect(() => {
		if (content || mood !== 'neutral') {
			saveDraft();
		}
	});

	// Sanitize rendered markdown
	function sanitize(html: string) {
		if (browser && Purify?.sanitize) {
			return Purify.sanitize(html, {
				ADD_TAGS: ['audio', 'source'],
				ADD_ATTR: ['controls', 'src']
			});
		}
		return html;
	}

	let previewHtml = $derived.by(() => sanitize(String(marked.parse(content || ''))));

	// Editor helpers
	function getTA() {
		return document.getElementById('content') as HTMLTextAreaElement | null;
	}

	function insertAtCursor(el: HTMLTextAreaElement, insertText: string) {
		const start = el.selectionStart || 0;
		const end = el.selectionEnd || 0;
		const before = el.value.substring(0, start);
		const after = el.value.substring(end);
		el.value = before + insertText + after;
		const pos = start + insertText.length;
		el.selectionStart = el.selectionEnd = pos;
		content = el.value;
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
		content = ta.value;
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
		content = ta.value;
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
		content = ta.value;
		const pos = (before + block).length;
		ta.selectionStart = ta.selectionEnd = pos;
		ta.focus();
	}

	function insertHorizontalRule() {
		const ta = getTA();
		if (!ta) return;
		insertAtCursor(ta, '\n\n---\n\n');
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
		content = ta.value;
		const urlStart = (before + `[${selected}](`).length;
		const urlEnd = urlStart + 3;
		ta.selectionStart = urlStart;
		ta.selectionEnd = urlEnd;
		ta.focus();
	}

	function handleTemplateSelect(templateContent: string) {
		content = templateContent;
		const ta = getTA();
		if (ta) ta.focus();
	}

	function onEditorKeyDown(e: KeyboardEvent) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
			e.preventDefault();
			wrapSelection('**', '**');
		} else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
			e.preventDefault();
			wrapSelection('*', '*');
		} else if (e.key === 'Tab') {
			e.preventDefault();
			const ta = getTA();
			if (!ta) return;
			insertAtCursor(ta, '  ');
		}
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
				attachments = attachments.concat(body.files);
				for (const f of body.files) {
					if (f.type && f.type.startsWith('image/')) {
						content += `\n\n![](${f.url})\n\n`;
					} else if (f.type && f.type.startsWith('audio/')) {
						content += `\n\n<audio controls src="${f.url}"></audio>\n\n`;
					} else {
						content += `\n\n[attachment](${f.url})\n\n`;
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
</script>

<svelte:head>
	<title>New Entry | Mood Journal</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="max-w-5xl mx-auto px-4 py-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center gap-4 mb-4">
				<a href="/journal" class="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
					← Back to Journal
				</a>
			</div>
			<h1 class="text-3xl font-bold text-gray-900 dark:text-white">New Entry</h1>
			<p class="text-gray-600 dark:text-gray-400 mt-2">Write your thoughts for today</p>
		</div>

		{#if form?.error}
			<div class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
				{form.error}
			</div>
		{/if}

		<form method="POST" use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update();
				submitting = false;
				clearDraft();
			};
		}}>
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Editor Section -->
				<div class="space-y-6">
					<!-- Template Selector -->
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
						<h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Start with a Template</h2>
						<TemplateSelector onSelectTemplate={handleTemplateSelect} />
					</div>

					<!-- Mood Selector -->
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
						<div class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
							How are you feeling?
						</div>
						<div class="grid grid-cols-5 gap-3">
							{#each ['happy', 'neutral', 'sad', 'anxious', 'excited'] as m}
								<button
									type="button"
									onclick={() => (mood = m)}
									class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all {mood === m
										? 'border-gray-900 dark:border-white bg-gray-100 dark:bg-gray-800'
										: 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}"
								>
									<span class="text-3xl">
										{#if m === 'happy'}😊
										{:else if m === 'neutral'}😐
										{:else if m === 'sad'}😢
										{:else if m === 'anxious'}😰
										{:else if m === 'excited'}🤩
										{/if}
									</span>
									<span class="text-xs font-medium capitalize text-gray-700 dark:text-gray-300">{m}</span>
								</button>
							{/each}
						</div>
						<input type="hidden" name="mood" value={mood} />
					</div>

					<!-- Editor -->
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
						<div class="border-b border-gray-200 dark:border-gray-700 p-4">
							<div class="flex flex-wrap gap-2">
								<button type="button" onclick={() => wrapSelection('**')} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="Bold (Cmd+B)">
									<strong>B</strong>
								</button>
								<button type="button" onclick={() => wrapSelection('*')} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="Italic (Cmd+I)">
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
								<button type="button" onclick={insertHorizontalRule} class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600" title="Horizontal Rule">
									HR
								</button>
								<label class="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer" title="Upload">
									📎
									<input type="file" class="hidden" multiple onchange={(e) => handleUpload(e.currentTarget.files)} />
								</label>
							</div>
						</div>
						<div
							role="button"
							tabindex="0"
							ondragover={handleDragOver}
							ondragleave={handleDragLeave}
							ondrop={handleDrop}
							class="relative {dragOver ? 'bg-gray-100 dark:bg-gray-800' : ''}"
						>
							<textarea
								id="content"
								name="content"
								bind:value={content}
								onkeydown={onEditorKeyDown}
								placeholder="Start writing your journal entry... (Markdown supported)"
								class="w-full min-h-[500px] p-6 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none"
								required
							></textarea>
							{#if uploading}
								<div class="absolute top-4 right-4 px-3 py-1 bg-gray-1000 text-white rounded-full text-sm">
									Uploading...
								</div>
							{/if}
						</div>
					</div>

					<!-- Submit Button -->
					<div class="flex gap-4">
						<button
							type="submit"
							disabled={submitting || !content.trim()}
							class="flex-1 px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white dark:text-gray-900 font-semibold rounded-lg transition-colors disabled:cursor-not-allowed"
						>
							{submitting ? 'Saving...' : 'Save Entry'}
						</button>
						<a href="/journal" class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center">
							Cancel
						</a>
					</div>
				</div>

				<!-- Preview Section -->
				<div class="space-y-6">
					<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
						<h2 class="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Preview</h2>
						<div class="prose dark:prose-invert max-w-none">
							{#if content.trim()}
								{@html previewHtml}
							{:else}
								<p class="text-gray-400 italic">Your preview will appear here...</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</form>
	</div>
</div>
