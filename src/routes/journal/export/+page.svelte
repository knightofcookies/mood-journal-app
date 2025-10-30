<script lang="ts">
	import type { PageData } from './$types';
	import { jsPDF } from 'jspdf';

	let { data }: { data: PageData } = $props();

	let startDate = $state('');
	let endDate = $state('');
	let includeMood = $state(true);
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
		end.setHours(23, 59, 59, 999); // Include the entire end date

		return data.entries.filter((entry) => {
			const entryDate = new Date(entry.createdAt);
			return entryDate >= start && entryDate <= end;
		});
	}

	function getSentimentEmoji(score: number | null): string {
		if (score === null) return '😐';
		if (score > 50) return '😊';
		if (score > 0) return '🙂';
		if (score === 0) return '😐';
		if (score > -50) return '😟';
		return '😢';
	}

	function getMoodEmoji(mood: string): string {
		const moodMap: Record<string, string> = {
			happy: '😊',
			neutral: '😐',
			sad: '😢',
			anxious: '😰',
			excited: '🤩',
			angry: '😠',
			calm: '😌',
			stressed: '😫'
		};
		return moodMap[mood.toLowerCase()] || '😐';
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
			doc.text('My Mood Journal', margin, y);
			y += 15;

			// Date range
			doc.setFontSize(12);
			doc.setFont('helvetica', 'normal');
			doc.setTextColor(100);
			doc.text(
				`Exported: ${new Date().toLocaleDateString()} | Entries: ${filteredEntries.length}`,
				margin,
				y
			);
			y += 10;
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
				const moodCounts = filteredEntries.reduce(
					(acc, e) => {
						acc[e.mood] = (acc[e.mood] || 0) + 1;
						return acc;
					},
					{} as Record<string, number>
				);
				const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

				doc.setFillColor(240, 240, 250);
				doc.rect(margin, y, maxWidth, 30, 'F');
				y += 8;

				doc.setFontSize(14);
				doc.setFont('helvetica', 'bold');
				doc.setTextColor(0);
				doc.text('📊 Summary Statistics', margin + 5, y);
				y += 8;

				doc.setFontSize(10);
				doc.setFont('helvetica', 'normal');
				doc.text(`Average Sentiment: ${Math.round(avgSentiment)} ${getSentimentEmoji(avgSentiment)}`, margin + 5, y);
				y += 6;
				doc.text(`Most Common Mood: ${topMood[0]} ${getMoodEmoji(topMood[0])} (${topMood[1]} entries)`, margin + 5, y);
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

				if (includeMood) {
					const moodText = `${getMoodEmoji(entry.mood)} ${entry.mood}`;
					doc.text(moodText, pageWidth - margin - doc.getTextWidth(moodText), y);
				}
				y += 8;

				// Sentiment
				if (includeSentiment && entry.sentimentScore !== null) {
					doc.setFontSize(9);
					doc.setFont('helvetica', 'normal');
					doc.setTextColor(100);
					doc.text(
						`Sentiment: ${getSentimentEmoji(entry.sentimentScore)} ${entry.sentimentScore > 0 ? '+' : ''}${entry.sentimentScore}`,
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
				doc.setDrawColor(200);
				doc.line(margin, y, pageWidth - margin, y);
				y += 10;
			}

			// Save the PDF
			const filename = `mood-journal-${startDate}-to-${endDate}.pdf`;
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
					mood: entry.mood,
					sentimentScore: entry.sentimentScore,
					sentimentLabel: entry.sentimentLabel,
					createdAt: entry.createdAt
				}))
			};

			const blob = new Blob([JSON.stringify(exportData, null, 2)], {
				type: 'application/json'
			});
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `mood-journal-${startDate}-to-${endDate}.json`;
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
			let markdown = `# My Mood Journal\n\n`;
			markdown += `**Exported:** ${new Date().toLocaleDateString()}\n\n`;
			markdown += `**Period:** ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}\n\n`;
			markdown += `**Total Entries:** ${filteredEntries.length}\n\n`;
			markdown += `---\n\n`;

			for (const entry of filteredEntries) {
				markdown += `## ${new Date(entry.createdAt).toLocaleDateString('en-US', {
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})}\n\n`;
				markdown += `**Mood:** ${getMoodEmoji(entry.mood)} ${entry.mood}\n\n`;
				if (includeSentiment && entry.sentimentScore !== null) {
					markdown += `**Sentiment:** ${getSentimentEmoji(entry.sentimentScore)} ${entry.sentimentScore > 0 ? '+' : ''}${entry.sentimentScore}\n\n`;
				}
				markdown += `${entry.content}\n\n`;
				markdown += `---\n\n`;
			}

			const blob = new Blob([markdown], { type: 'text/markdown' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `mood-journal-${startDate}-to-${endDate}.md`;
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
	<title>Export Journal - Mood Journal</title>
</svelte:head>

<div class="max-w-4xl mx-auto p-6 space-y-8">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Export Your Journal</h1>
		<p class="text-gray-600 dark:text-gray-400">
			Download your journal entries in your preferred format
		</p>
	</div>

	<!-- Export Configuration -->
	<div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
		<!-- Date Range -->
		<div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">📅 Date Range</h3>
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label for="start-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						Start Date
					</label>
					<input
						id="start-date"
						type="date"
						bind:value={startDate}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
					/>
				</div>
				<div>
					<label for="end-date" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
						End Date
					</label>
					<input
						id="end-date"
						type="date"
						bind:value={endDate}
						class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
					/>
				</div>
			</div>
			<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">
				{filteredCount} {filteredCount === 1 ? 'entry' : 'entries'} in selected range
			</p>
		</div>

		<!-- Format Selection -->
		<div>
			<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">📄 Export Format</h3>
			<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
				<button
					onclick={() => (format = 'pdf')}
					class="p-4 border-2 rounded-lg transition-all {format === 'pdf'
						? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
						: 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}"
					type="button"
				>
					<div class="text-3xl mb-2">📕</div>
					<div class="font-medium text-gray-900 dark:text-white">PDF</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">Formatted document</div>
				</button>
				<button
					onclick={() => (format = 'json')}
					class="p-4 border-2 rounded-lg transition-all {format === 'json'
						? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
						: 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}"
					type="button"
				>
					<div class="text-3xl mb-2">💾</div>
					<div class="font-medium text-gray-900 dark:text-white">JSON</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">Data backup</div>
				</button>
				<button
					onclick={() => (format = 'markdown')}
					class="p-4 border-2 rounded-lg transition-all {format === 'markdown'
						? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
						: 'border-gray-300 dark:border-gray-600 hover:border-gray-400'}"
					type="button"
				>
					<div class="text-3xl mb-2">📝</div>
					<div class="font-medium text-gray-900 dark:text-white">Markdown</div>
					<div class="text-xs text-gray-500 dark:text-gray-400">Plain text</div>
				</button>
			</div>
		</div>

		<!-- Export Options -->
		{#if format === 'pdf'}
			<div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">⚙️ PDF Options</h3>
				<div class="space-y-3">
					<label class="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={includeMood}
							class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<span class="text-gray-700 dark:text-gray-300">Include mood indicators</span>
					</label>
					<label class="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={includeSentiment}
							class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<span class="text-gray-700 dark:text-gray-300">Include sentiment scores</span>
					</label>
					<label class="flex items-center gap-3 cursor-pointer">
						<input
							type="checkbox"
							bind:checked={includeStats}
							class="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
						/>
						<span class="text-gray-700 dark:text-gray-300">Include summary statistics</span>
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
			class="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
		>
			{#if exporting}
				<div class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
				<span>Exporting...</span>
			{:else}
				<span>⬇️</span>
				<span>Export {format.toUpperCase()}</span>
			{/if}
		</button>
		<a
			href="/journal"
			class="px-6 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
		>
			Back to Journal
		</a>
	</div>

	<!-- Info Box -->
	<div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
		<h4 class="font-semibold text-blue-900 dark:text-blue-300 mb-2">💡 Export Tips</h4>
		<ul class="text-sm text-blue-800 dark:text-blue-300 space-y-1">
			<li>• <strong>PDF:</strong> Best for printing or sharing a beautiful formatted copy</li>
			<li>• <strong>JSON:</strong> Complete data backup with all metadata for importing elsewhere</li>
			<li>• <strong>Markdown:</strong> Plain text format that's easy to edit and version control</li>
		</ul>
	</div>
</div>
