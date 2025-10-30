import { redirect, type RequestEvent } from '@sveltejs/kit';
import { getGoogleAuthUrl } from '$lib/server/google-auth';

export async function GET({ url, cookies }: RequestEvent) {
	// Generate a random state for CSRF protection
	const state = crypto.randomUUID();

	// Store state in cookie for verification
	cookies.set('oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		maxAge: 60 * 10 // 10 minutes
	});

	// Build redirect URI
	const redirectUri = `${url.origin}/auth/google/callback`;

	// Redirect to Google OAuth
	const authUrl = getGoogleAuthUrl(redirectUri, state);
	throw redirect(302, authUrl);
}
