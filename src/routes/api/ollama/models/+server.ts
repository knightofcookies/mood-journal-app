import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

const OLLAMA_BASE_URL = env.OLLAMA_BASE_URL || 'http://localhost:11434';

export const GET: RequestHandler = async () => {
	try {
		// Check if Ollama is available
		const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
			signal: AbortSignal.timeout(3000)
		});

		if (!response.ok) {
			return json({
				available: false,
				models: [],
				error: 'Ollama is not responding'
			});
		}

		const data = await response.json();
		type OllamaModel = { name: string; size?: number; modified_at?: string };
		const models = (data.models || []).map((model: OllamaModel) => ({
			name: model.name,
			size: model.size,
			modified: model.modified_at,
			// Extract base model name and size for display
			displayName: formatModelName(model.name)
		}));

		return json({
			available: true,
			models,
			baseUrl: OLLAMA_BASE_URL
		});
	} catch (error) {
		return json({
			available: false,
			models: [],
			error: error instanceof Error ? error.message : 'Failed to connect to Ollama'
		});
	}
};

function formatModelName(name: string): string {
	// Format model name for display
	// e.g., "llama3.2:3b" -> "Llama 3.2 (3B)"
	const parts = name.split(':');
	const baseName = parts[0];
	const tag = parts[1] || 'latest';

	// Capitalize and format base name
	const formatted = baseName
		.split(/[-_.]/)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');

	// Format tag
	const tagFormatted = tag === 'latest' ? '' : ` (${tag.toUpperCase()})`;

	return `${formatted}${tagFormatted}`;
}
