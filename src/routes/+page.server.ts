import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { validateSessionToken } from '$lib/server/auth';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = cookies.get('auth-session');
	const { user } = await validateSessionToken(token || '');
	if (user) throw redirect(303, '/journal');
	throw redirect(303, '/auth/login');
};
