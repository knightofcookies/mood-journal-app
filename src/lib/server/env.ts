// Centralized environment loader using valibot with validation
import * as v from 'valibot';
import { env as svelteEnv } from '$env/dynamic/private';

const EnvSchema = v.object({
	// Required in production
	DATABASE_URL: v.optional(v.pipe(v.string(), v.minLength(1)), './data/app.db'),
	// Optional services
	SENTIMENT_API_URL: v.optional(v.string(), 'http://localhost:5001'),
	REDIS_URL: v.optional(v.string()),
	GROQ_API_KEY: v.optional(v.string()),
	GOOGLE_CLIENT_ID: v.optional(v.string()),
	GOOGLE_CLIENT_SECRET: v.optional(v.string()),
	GOOGLE_REDIRECT_URI: v.optional(v.string()),
	NODE_ENV: v.optional(v.string(), 'development')
});

// Read from SvelteKit's env system first, then fall back to process.env
const keys = [
	'DATABASE_URL',
	'SENTIMENT_API_URL',
	'REDIS_URL',
	'GROQ_API_KEY',
	'GOOGLE_CLIENT_ID',
	'GOOGLE_CLIENT_SECRET',
	'GOOGLE_REDIRECT_URI',
	'NODE_ENV'
] as const;

const raw = Object.fromEntries(
	keys.map((k) => [k, svelteEnv[k] || process.env[k as keyof NodeJS.ProcessEnv]])
) as Record<string, string | undefined>;

// Debug: Log GROQ_API_KEY status
console.log('[env] GROQ_API_KEY check:', {
	exists: !!process.env.GROQ_API_KEY,
	length: process.env.GROQ_API_KEY?.length || 0,
	first10: process.env.GROQ_API_KEY?.substring(0, 10) || 'undefined'
});

// Validate environment variables
let validatedEnv;
try {
	validatedEnv = v.parse(EnvSchema, raw);
} catch (error) {
	console.error('Environment validation failed:');
	if (error instanceof v.ValiError) {
		for (const issue of error.issues) {
			console.error(
				`  - ${issue.path?.map((p: { key: string }) => p.key).join('.')}: ${issue.message}`
			);
		}
	}
	throw new Error('Invalid environment configuration. Please check your .env file.');
}

export const env = validatedEnv;

// Runtime validation helpers
export function requireEnv(key: keyof typeof env): string {
	const value = env[key];
	if (!value) {
		throw new Error(`Required environment variable ${key} is not set`);
	}
	return value;
}

export function validateProductionEnv(): void {
	if (env.NODE_ENV === 'production') {
		const required = ['DATABASE_URL'];
		const missing = required.filter((key) => !env[key as keyof typeof env]);

		if (missing.length > 0) {
			throw new Error(
				`Missing required environment variables for production: ${missing.join(', ')}`
			);
		}

		// Warn about missing optional but recommended vars
		if (!env.REDIS_URL) {
			console.warn(
				'[env] REDIS_URL not set - using in-memory rate limiting (not recommended for production)'
			);
		}
	}
}

// Validate on module load
validateProductionEnv();

export type Env = typeof env;
