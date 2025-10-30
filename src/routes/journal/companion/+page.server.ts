import { fail } from '@sveltejs/kit';
import { getAISettings, getConversationHistory, chat, clearConversation } from '$lib/server/ai';
import { allow as allowRate } from '$lib/server/rateLimit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = locals.user;
	if (!user) {
		return { messages: [], settings: null };
	}

	const settings = await getAISettings(user.id);
	const entryId = url.searchParams.get('entry');

	// Get conversation history
	const messages = await getConversationHistory(user.id, entryId ?? undefined);

	// Check if API key is configured based on provider
	const hasRequiredApiKey = settings
		? (() => {
				const provider = settings.provider?.toLowerCase();
				switch (provider) {
					case 'openai':
						return !!settings.openaiApiKey;
					case 'groq':
						return !!settings.groqApiKey;
					case 'gemini':
						return !!settings.geminiApiKey;
					case 'local':
						return true; // Local models don't need an API key
					default:
						return !!settings.openaiApiKey; // Default to OpenAI
				}
			})()
		: false;

	return {
		messages: messages.map((m) => ({
			role: m.role,
			content: m.content,
			created_at: m.createdAt
		})),
		settings: settings
			? {
					ai_enabled: settings.aiEnabled,
					privacy_consent: settings.privacyConsent,
					has_api_key: hasRequiredApiKey,
					provider: settings.provider,
					model: settings.model
				}
			: null,
		entryId: entryId ?? null
	};
};

export const actions: Actions = {
	sendMessage: async ({ request, locals, url, getClientAddress }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		// Rate limit: 10 messages per minute per user
		const ip = getClientAddress();
		const ok = await allowRate(`ai-chat:${user.id}:${ip}`, 10, 60_000);
		if (!ok) {
			return fail(429, {
				message: 'Too many messages. Please wait a moment before sending another message.'
			});
		}

		const data = await request.formData();
		const message = data.get('message') as string;
		const entryId = url.searchParams.get('entry') ?? undefined;

		if (!message || message.trim().length === 0) {
			return fail(400, { message: 'Message cannot be empty' });
		}

		// Check AI settings
		const settings = await getAISettings(user.id);
		if (!settings || !settings.aiEnabled || !settings.privacyConsent) {
			return fail(403, {
				message: 'AI companion is not enabled. Please enable it in settings first.'
			});
		}

		try {
			const response = await chat(user.id, message.trim(), settings, entryId);

			return { success: true, response };
		} catch (error) {
			console.error('Error chatting with AI:', error);
			const message =
				error instanceof Error ? error.message : 'Failed to get response from AI companion';
			if (error instanceof Error && /API key is not configured/i.test(error.message)) {
				return fail(400, { message });
			}
			return fail(500, { message: 'Failed to get response from AI companion' });
		}
	},

	clearHistory: async ({ locals, url }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const entryId = url.searchParams.get('entry') ?? undefined;

		try {
			await clearConversation(user.id, entryId);
			return { success: true, cleared: true };
		} catch (error) {
			console.error('Error clearing conversation:', error);
			return fail(500, { message: 'Failed to clear conversation' });
		}
	}
};
