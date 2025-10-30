import { redirect, error, type RequestEvent } from '@sveltejs/kit';
import { exchangeCodeForTokens, getGoogleUser } from '$lib/server/google-auth';
import { createSession, generateSessionToken, sessionCookieName } from '$lib/server/auth';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(event: RequestEvent) {
	const { url, cookies } = event;
	const code = url.searchParams.get('code');
	const state = url.searchParams.get('state');
	const storedState = cookies.get('oauth_state');

	// Verify state for CSRF protection
	if (!state || !storedState || state !== storedState) {
		throw error(400, 'Invalid state parameter');
	}

	// Clear the state cookie
	cookies.delete('oauth_state', { path: '/' });

	if (!code) {
		throw error(400, 'No authorization code provided');
	}

	try {
		// Exchange code for tokens
		const redirectUri = `${url.origin}/auth/google/callback`;
		const tokens = await exchangeCodeForTokens(code, redirectUri);

		// Get user info from Google
		const googleUser = await getGoogleUser(tokens.access_token);

		// Check if user exists
		let [user] = await db
			.select()
			.from(table.user)
			.where(eq(table.user.email, googleUser.email))
			.limit(1);

		const now = new Date();

		if (!user) {
			// Create new user
			const userId = crypto.randomUUID();
			const username = googleUser.email.split('@')[0] + '_' + Date.now().toString().slice(-4);

			await db.insert(table.user).values({
				id: userId,
				email: googleUser.email,
				name: googleUser.name,
				username,
				avatarUrl: googleUser.picture,
				passwordHash: '', // No password for Google users
				createdAt: now,
				updatedAt: now,
				failedAttempts: 0,
				lockedUntil: new Date(0)
			});

			// Create account record for OAuth provider
			await db.insert(table.account).values({
				userId: userId,
				type: 'oauth',
				provider: 'google',
				providerAccountId: googleUser.id,
				accessToken: tokens.access_token,
				refreshToken: tokens.refresh_token || null,
				expiresAt: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
				tokenType: tokens.token_type || 'Bearer',
				scope: tokens.scope || null,
				idToken: tokens.id_token || null
			});

			[user] = await db.select().from(table.user).where(eq(table.user.id, userId)).limit(1);
		} else {
			// Update existing user's avatar if changed
			if (user.avatarUrl !== googleUser.picture) {
				await db
					.update(table.user)
					.set({
						avatarUrl: googleUser.picture,
						updatedAt: now
					})
					.where(eq(table.user.id, user.id));
			}

			// Ensure account record exists for existing users
			const [existingAccount] = await db
				.select()
				.from(table.account)
				.where(eq(table.account.userId, user.id))
				.limit(1);

			if (!existingAccount) {
				await db.insert(table.account).values({
					userId: user.id,
					type: 'oauth',
					provider: 'google',
					providerAccountId: googleUser.id,
					accessToken: tokens.access_token,
					refreshToken: tokens.refresh_token || null,
					expiresAt: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
					tokenType: tokens.token_type || 'Bearer',
					scope: tokens.scope || null,
					idToken: tokens.id_token || null
				});
			}
		}

		// Create session (auth.ts cookie)
		const token = generateSessionToken();
		const session = await createSession(token, user.id);
		cookies.set(sessionCookieName, token, {
			path: '/',
			httpOnly: true,
			sameSite: 'lax',
			secure: process.env.NODE_ENV === 'production',
			expires: session.expires
		});
	} catch (err) {
		console.error('Google OAuth error:', err);
		throw error(500, 'Authentication failed');
	}

	// Redirect to journal
	throw redirect(303, '/journal');
}
