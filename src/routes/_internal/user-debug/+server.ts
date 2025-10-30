import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export async function POST({ request }) {
	if (process.env.NODE_ENV === 'production') return new Response(null, { status: 404 });
	const form = await request.formData();
	const email = String(form.get('email') || '');
	if (!email) return new Response(JSON.stringify({ error: 'missing email' }), { status: 400 });
	const [row] = await db
		.select({
			id: table.user.id,
			username: table.user.username,
			email: table.user.email,
			created_at: table.user.createdAt
		})
		.from(table.user)
		.where(eq(table.user.email, email));
	return new Response(JSON.stringify({ row }), {
		status: 200,
		headers: { 'Content-Type': 'application/json' }
	});
}
