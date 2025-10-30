import { fail } from '@sveltejs/kit';
import { getAISettings, saveAISettings } from '$lib/server/ai';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		return { settings: null };
	}

	const settings = await getAISettings(user.id);

	return {
		settings: settings
			? {
					ai_enabled: settings.aiEnabled,
					privacy_consent: settings.privacyConsent,
					provider: settings.provider,
					model: settings.model,
					has_openai_key: !!settings.openaiApiKey,
					has_groq_key: !!settings.groqApiKey,
					has_gemini_key: !!settings.geminiApiKey
				}
			: null
	};
};

export const actions: Actions = {
	saveSettings: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			return fail(401, { message: 'Unauthorized' });
		}

		const data = await request.formData();
		const ai_enabled = data.get('ai_enabled') === 'true';
		const privacy_consent = data.get('privacy_consent') === 'true';
		const provider = (data.get('provider') as string | null) ?? undefined;
		const model = (data.get('model') as string | null) ?? undefined;
		const openai_api_key = data.get('openai_api_key') as string | null;
		const groq_api_key = data.get('groq_api_key') as string | null;
		const gemini_api_key = data.get('gemini_api_key') as string | null;

		// Validate privacy consent if enabling AI
		if (ai_enabled && !privacy_consent) {
			return fail(400, {
				message: 'You must accept the privacy policy to enable the AI companion'
			});
		}

		try {
			const updateData: {
				ai_enabled: boolean;
				privacy_consent: boolean;
				provider?: string;
				model?: string;
				openai_api_key?: string;
				groq_api_key?: string;
				gemini_api_key?: string;
			} = {
				ai_enabled,
				privacy_consent
			};

			if (provider) updateData.provider = provider;
			if (model) updateData.model = model;

			// Only update API key if provided
			if (openai_api_key && openai_api_key.trim().length > 0) {
				updateData.openai_api_key = openai_api_key.trim();
			}
			if (groq_api_key && groq_api_key.trim().length > 0) {
				updateData.groq_api_key = groq_api_key.trim();
			}
			if (gemini_api_key && gemini_api_key.trim().length > 0) {
				updateData.gemini_api_key = gemini_api_key.trim();
			}

			await saveAISettings(user.id, updateData);

			return { success: true };
		} catch (error) {
			console.error('Error saving AI settings:', error);
			return fail(500, { message: 'Failed to save settings' });
		}
	}
};
