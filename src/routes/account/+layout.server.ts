import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/auth/login');
	const user = {
		id: locals.user.id,
		username: locals.user.username,
		avatar_url: (locals.user as { avatar_url?: string | null }).avatar_url ?? null,
		email: (locals.user as { email: string }).email
	};
	return { user };
};
