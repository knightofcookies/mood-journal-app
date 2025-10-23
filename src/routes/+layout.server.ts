import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	// expose minimal user info to the client layout for header/nav
	const user = locals.user
		? {
				id: locals.user.id,
				username: locals.user.username,
				avatar_url: (locals.user as { avatar_url?: string | null }).avatar_url ?? null
			}
		: null;
	return { user };
};
