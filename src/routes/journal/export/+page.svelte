<script lang="ts">
	import type { PageData } from './$types';
	import { jsPDF } from 'jspdf';

	let { data }: { data: PageData } = $props();

	let startDate = $state('');
	let endDate = $state('');
	let includeSentiment = $state(true);
	let includeStats = $state(true);
	let format = $state<'pdf' | 'json' | 'markdown'>('pdf');
	let exporting = $state(false);

	// Set default date range
	$effect(() => {
		if (data.dateRange) {
			startDate = new Date(data.dateRange.oldest).toISOString().split('T')[0];
			endDate = new Date(data.dateRange.newest).toISOString().split('T')[0];
		}
	});

	function getFilteredEntries() {
		if (!startDate || !endDate) return data.entries;

		const start = new Date(startDate);
		const end = new Date(endDate);
		end.setHours(23, 59, 59, 999);

		return data.entries.filter((entry) => {
			const entryDate = new Date(entry.createdAt);
			return entryDate >= start && entryDate <= end;
		});
	}

	function getSentimentLabel(score: number | null): string {
		if (score === null) return 'Neutral';
		if (score > 50) return 'Very Positive';
		if (score > 0) return 'Positive';
		if (score === 0) return 'Neutral';
		if (score > -50) return 'Negative';
		return 'Very Negative';
	}

	async function exportToPDF() {
		exporting = true;
		try {
			const filteredEntries = getFilteredEntries();
			const doc = new jsPDF();
			const pageWidth = doc.internal.pageSize.width;
			const pageHeight = doc.internal.pageSize.height;
			const margin = 20;
			const maxWidth = pageWidth - 2 * margin;
			let y = margin;

			// Title
			doc.setFontSize(24);
			doc.setFont('helvetica', 'bold');
			doc.text('Journal Export', margin, y);
			y += 15;

			// Metadata
			doc.setFontSize(11);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(100);
			doc.text(
				`Exported: ${new Date().toLocaleDateString()} | Entries: ${filteredEntries.length}`,
				margin,
				y
			);
			y += 7;
			doc.text(
				`Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
				margin,
				y
			);
			y += 15;

			// Statistics
			if (includeStats && filteredEntries.length > 0) {
				const avgSentiment =
					filteredEntries.reduce((sum, e) => sum + (e.sentimentScore || 0), 0) /
					filteredEntries.length;

				doc.setFillColor(245, 247, 250);
				doc.rect(margin, y, maxWidth, 25, 'F');
				y += 8;

				doc.setFontSize(14);
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0);
				doc.text('Summary Statistics', margin + 5, y);
				y += 8;

				doc.setFontSize(10);
				doc.setFont('helvetica', 'normal');
				doc.text(
					`Average Sentiment: ${Math.round(avgSentiment)} (${getSentimentLabel(avgSentiment)})`,
					margin + 5,
					y
				);
				y += 15;
			}

			// Entries
			doc.setFontSize(16);
			doc.setFont('helvetica', 'bold');
			doc.setTextColor(0);
			doc.text('Journal Entries', margin, y);
			y += 10;

			for (let i = 0; i < filteredEntries.length; i++) {
				const entry = filteredEntries[i];

				// Check if we need a new page
				if (y > pageHeight - 60) {
					doc.addPage();
					y = margin;
				}

				// Entry header
				doc.setFillColor(250, 250, 250);
				doc.rect(margin, y, maxWidth, 8, 'F');
				y += 6;

				doc.setFontSize(11);
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0);
				const dateStr = new Date(entry.createdAt).toLocaleDateString('en-US', {
					weekday: 'short',
					year: 'numeric',
					month: 'short',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				});
				doc.text(dateStr, margin + 2, y);
				y += 8;

				// Sentiment
				if (includeSentiment && entry.sentimentScore !== null) {
					doc.setFontSize(9);
					doc.setFont('helvetica', 'normal');
					doc.setTextColor(100);
					doc.text(
						`Sentiment: ${entry.sentimentScore > 0 ? '+' : ''}${entry.sentimentScore} (${getSentimentLabel(entry.sentimentScore)})`,
						margin + 2,
						y
					);
					y += 6;
				}

				// Content
				doc.setFontSize(10);
				doc.setFont('helvetica', 'normal');
				doc.setTextColor(0);

				// Clean markdown from content
				const cleanContent = entry.content
					.replace(/[#*_`~\[\]()]/g, '')
					.replace(/!\[.*?\]\(.*?\)/g, '')
					.replace(/\[.*?\]\(.*?\)/g, '')
					.trim();

				const lines = doc.splitTextToSize(cleanContent, maxWidth - 4);
				for (const line of lines) {
					if (y > pageHeight - 20) {
						doc.addPage();
						y = margin;
					}
					doc.text(line, margin + 2, y);
					y += 5;
				}

				y += 8;
				doc.setDrawColor(220);
				doc.line(margin, y, pageWidth - margin, y);
				y += 10;
			}

			// Save the PDF
			const filename = `journal-export-${startDate}-to-${endDate}.pdf`;
			doc.save(filename);
		} catch (error) {
			console.error('PDF export failed:', error);
			alert('Failed to export PDF. Please try again.');
		} finally {
			exporting = false;
		}
	}

	async function exportToJSON() {
		exporting = true;
		try {
			const filteredEntries = getFilteredEntries();
			const exportData = {
				exported: new Date().toISOString(),
				dateRange: {
					start: startDate,
					end: endDate
				},
				totalEntries: filteredEntries.length,
				entries: filteredEntries.map((entry) => ({
					id: entry.id,
					content: entry.content,
					...(includeSentiment && {
						sentimentScore: entry.sentimentScore,
						sentimentLabel: entry.sentimentLabel
					}),
					createdAt: entry.createdAt
				}))
			};

			const blob = new Blob([JSON.stringify(exportData, null, 2)], {
				type: 'application/json'
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `journal-export-${startDate}-to-${endDate}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('JSON export failed:', error);
			alert('Failed to export JSON. Please try again.');
		} finally {
			exporting = false;
		}
	}

	async function exportToMarkdown() {
		exporting = true;
		try {
			const filteredEntries = getFilteredEntries();
			let markdown = `# Journal Export\n\n`;
			markdown += `**Exported:** ${new Date().toLocaleDateString()}\n\n`;
			markdown += `**Period:** ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}\n\n`;
			markdown += `**Total Entries:** ${filteredEntries.length}\n\n`;

			if (includeStats && filteredEntries.length > 0) {
				const avgSentiment =
					filteredEntries.reduce((sum, e) => sum + (e.sentimentScore || 0), 0) /
					filteredEntries.length;

				markdown += `## Summary Statistics\n\n`;
				markdown += `- **Average Sentiment:** ${Math.round(avgSentiment)} (${getSentimentLabel(avgSentiment)})\n\n`;
			}

			markdown += `---\n\n`;

			for (const entry of filteredEntries) {
				markdown += `## ${new Date(entry.createdAt).toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit'
				})}\n\n`;
				
				if (includeSentiment && entry.sentimentScore !== null) {
					markdown += `**Sentiment:** ${entry.sentimentScore > 0 ? '+' : ''}${entry.sentimentScore} (${getSentimentLabel(entry.sentimentScore)})\n\n`;
				}
				markdown += `${entry.content}\n\n`;
				markdown += `---\n\n`;
			}

			const blob = new Blob([markdown], { type: 'text/markdown' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `journal-export-${startDate}-to-${endDate}.md`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Markdown export failed:', error);
			alert('Failed to export Markdown. Please try again.');
		} finally {
			exporting = false;
		}
	}

	async function handleExport() {
		if (format === 'pdf') {
			await exportToPDF();
		} else if (format === 'json') {
			await exportToJSON();
		} else if (format === 'markdown') {
			await exportToMarkdown();
		}
	}

	const filteredCount = $derived(getFilteredEntries().length);
</script>

<svelte:head>
	<title>Export Journal</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-8 p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold gradient-text">Export Your Journal</h1>
		<p class="text-base text-muted-foreground">
			Download your journal entries in your preferred format
		</p>
	</div>

	<!-- Export Configuration -->
	<div class="notion-card space-y-6">
		<!-- Date Range -->
		<div>
			<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
				</svg>
				Date Range
			</h3>
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<label
						for="start-date"
						class="mb-2 block text-sm font-medium text-foreground"
					>
						Start Date
					</label>
					<input
						id="start-date"
						type="date"
						bind:value={startDate}
						class="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
				</div>
				<div>
					<label
						for="end-date"
						class="mb-2 block text-sm font-medium text-foreground"
					>
						End Date
					</label>
					<input
						id="end-date"
						type="date"
						bind:value={endDate}
						class="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
					/>
				</div>
			</div>
			<p class="mt-3 text-sm text-muted-foreground">
				<span class="font-semibold text-primary">{filteredCount}</span>
				{filteredCount === 1 ? 'entry' : 'entries'} in selected range
			</p>
		</div>

		<!-- Format Selection -->
		<div>
			<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
				</svg>
				Export Format
			</h3>
			<div class="grid grid-cols-1 gap-3 md:grid-cols-3">
				<button
					onclick={() => (format = 'pdf')}
					class="group rounded-xl border-2 p-5 transition-all hover:scale-[1.02] {format === 'pdf'
						? 'border-primary bg-primary/5 shadow-sm'
						: 'border-border hover:border-primary/50'}"
					type="button"
				>
					<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-red-500/10 to-red-600/10">
						<svg class="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
						</svg>
					</div>
					<div class="font-semibold text-foreground">PDF</div>
					<div class="mt-1 text-xs text-muted-foreground">Formatted document</div>
				</button>
				<button
					onclick={() => (format = 'json')}
					class="group rounded-xl border-2 p-5 transition-all hover:scale-[1.02] {format === 'json'
						? 'border-primary bg-primary/5 shadow-sm'
						: 'border-border hover:border-primary/50'}"
					type="button"
				>
					<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10">
						<svg class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
						</svg>
					</div>
					<div class="font-semibold text-foreground">JSON</div>
					<div class="mt-1 text-xs text-muted-foreground">Data backup</div>
				</button>
				<button
					onclick={() => (format = 'markdown')}
					class="group rounded-xl border-2 p-5 transition-all hover:scale-[1.02] {format === 'markdown'
						? 'border-primary bg-primary/5 shadow-sm'
						: 'border-border hover:border-primary/50'}"
					type="button"
				>
					<div class="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10">
						<svg class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
						</svg>
					</div>
					<div class="font-semibold text-foreground">Markdown</div>
					<div class="mt-1 text-xs text-muted-foreground">Plain text</div>
				</button>
			</div>
		</div>

		<!-- Export Options -->
		{#if format === 'pdf'}
			<div>
				<h3 class="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
					<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					PDF Options
				</h3>
				<div class="space-y-3">
					<label class="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
						<input
							type="checkbox"
							bind:checked={includeSentiment}
							class="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
						/>
						<span class="text-foreground">Include sentiment scores</span>
					</label>
					<label class="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent">
						<input
							type="checkbox"
							bind:checked={includeStats}
							class="h-5 w-5 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
						/>
						<span class="text-foreground">Include summary statistics</span>
					</label>
				</div>
			</div>
		{/if}
	</div>

	<!-- Export Button -->
	<div class="flex gap-4">
		<button
			onclick={handleExport}
			disabled={exporting || filteredCount === 0}
			class="notion-btn notion-btn-primary flex-1"
		>
			{#if exporting}
				<div
					class="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
				></div>
				<span>Exporting...</span>
			{:else}
				<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
				<span>Export {format.toUpperCase()}</span>
			{/if}
		</button>
		<a
			href="/journal"
			class="notion-btn notion-btn-secondary"
		>
			Back to Journal
		</a>
	</div>

	<!-- Info Box -->
	<div
		class="rounded-xl border border-primary/20 bg-primary/5 p-5"
	>
		<h4 class="mb-3 flex items-center gap-2 font-semibold text-primary">
			<svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
			</svg>
			Export Tips
		</h4>
		<ul class="space-y-2 text-sm text-foreground/80">
			<li class="flex items-start gap-2">
				<span class="mt-0.5 text-primary">•</span>
				<span><strong class="text-foreground">PDF:</strong> Best for printing or sharing a beautifully formatted copy</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="mt-0.5 text-primary">•</span>
				<span><strong class="text-foreground">JSON:</strong> Complete data backup with all metadata for importing elsewhere</span>
			</li>
			<li class="flex items-start gap-2">
				<span class="mt-0.5 text-primary">•</span>
				<span><strong class="text-foreground">Markdown:</strong> Plain text format that's easy to edit and version control</span>
			</li>
		</ul>
	</div>
</div>
