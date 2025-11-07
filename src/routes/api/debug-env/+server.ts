import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	// Debug endpoint to check environment variables
	return json({
		hasGroqKey: !!process.env.GROQ_API_KEY,
		groqKeyLength: process.env.GROQ_API_KEY?.length || 0,
		groqKeyPrefix: process.env.GROQ_API_KEY?.substring(0, 10) || 'undefined',
		allEnvKeys: Object.keys(process.env).filter(k => 
			k.includes('GROQ') || k.includes('DATABASE') || k.includes('GOOGLE')
		)
	});
};
