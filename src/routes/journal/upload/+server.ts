import { json, type RequestHandler } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { allow as allowRate } from '$lib/server/rateLimit';

export const POST: RequestHandler = async ({ request, locals, getClientAddress }) => {
	// Only allow authenticated users
	const user = locals.user;
	if (!user) return new Response(null, { status: 401 });

	// Rate limit by client IP
	const ip = getClientAddress();
	const ok = await allowRate(ip, 20, 60_000); // 20 requests per minute
	if (!ok) return json({ error: 'rate_limited' }, { status: 429 });

	// parse multipart form data
	const form = await request.formData();
	const file = form.get('file') as File | null;
	if (!file) return json({ error: 'missing file' }, { status: 400 });

	// basic validation
	const maxBytes = 10 * 1024 * 1024; // 10MB
	if (file.size > maxBytes) return json({ error: 'file too large' }, { status: 413 });

	const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/ogg'];
	if (!allowed.includes(file.type))
		return json({ error: 'unsupported file type' }, { status: 415 });

	const safeBase = path.basename(String(file.name || 'upload'));
	const filename = `${crypto.randomUUID()}-${safeBase}`;
	const uploadsDir = path.resolve(process.cwd(), 'static', 'uploads');
	if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
	const outPath = path.join(uploadsDir, filename);

	// write to disk
	const arrayBuffer = await file.arrayBuffer();
	fs.writeFileSync(outPath, Buffer.from(arrayBuffer));

	// Return file description; attachments can be associated when entry is saved
	const id = crypto.randomUUID();
	const url = `/uploads/${filename}`;
	return json({ ok: true, files: [{ id, url, type: file.type }] });
};
