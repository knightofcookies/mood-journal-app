<script lang="ts">
	import { journalTemplates, formatTemplate, type JournalTemplate } from '$lib/templates';

	interface Props {
		onSelectTemplate: (content: string) => void;
	}

	let { onSelectTemplate }: Props = $props();

	let showTemplates = $state(false);
	let selectedCategory = $state<string | null>(null);

	function handleSelectTemplate(template: JournalTemplate) {
		const formattedContent = formatTemplate(template.template);
		onSelectTemplate(formattedContent);
		showTemplates = false;
	}
</script>

<div class="template-selector">
	<button
		onclick={() => (showTemplates = !showTemplates)}
		class="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm"
		type="button"
	>
		<span class="text-lg">📝</span>
		<span>Use Template</span>
		<span class="text-xs opacity-75">({journalTemplates.length})</span>
	</button>

	{#if showTemplates}
		<div
			class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
			onclick={(e) => {
				if (e.target === e.currentTarget) showTemplates = false;
			}}
			role="dialog"
			aria-modal="true"
		>
			<div
				class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden"
			>
				<!-- Header -->
				<div
					class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
				>
					<div>
						<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Journal Templates</h2>
						<p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
							Choose a template to guide your journaling
						</p>
					</div>
					<button
						onclick={() => (showTemplates = false)}
						class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
						type="button"
						aria-label="Close"
					>
						×
					</button>
				</div>

				<!-- Templates Grid -->
				<div class="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{#each journalTemplates as template}
							<button
								onclick={() => handleSelectTemplate(template)}
								class="text-left p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-lg border-2 border-transparent hover:border-purple-500 dark:hover:border-purple-400 transition-all hover:shadow-lg group"
								type="button"
							>
								<div class="flex items-start gap-3 mb-3">
									<span class="text-3xl group-hover:scale-110 transition-transform">
										{template.icon}
									</span>
									<div class="flex-1">
										<h3 class="font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
											{template.name}
										</h3>
									</div>
								</div>
								<p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
									{template.description}
								</p>
								<div class="text-xs text-gray-500 dark:text-gray-500 space-y-1">
									{#each template.prompts.slice(0, 2) as prompt}
										<div class="flex items-start gap-1">
											<span class="opacity-50">•</span>
											<span class="line-clamp-1">{prompt}</span>
										</div>
									{/each}
									{#if template.prompts.length > 2}
										<div class="opacity-50">+{template.prompts.length - 2} more prompts</div>
									{/if}
								</div>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
