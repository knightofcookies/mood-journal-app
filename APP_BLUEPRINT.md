# Mood Journal — Application Blueprint

This document is a concise blueprint for the Mood Journal application: what it is, core concepts, architecture, APIs, UX flows, security considerations, and the current status of development.

## Goal

Build a small, privacy-first mood journaling web app where authenticated users can create short markdown entries, tag them with a mood, upload attachments (images/audio), and view a recent feed of their entries.

The UI should be lightweight and mobile-friendly, support progressive enhancement (server remotes + native forms), and favor server-side validation and sanitization.

## Tech stack

- Frontend: Svelte 5 + SvelteKit (runes), Tailwind classes used in templates
- Server: SvelteKit server routes and remote `form`/`query` helpers
- DB: Drizzle (SQLite backend via better-sqlite3)
- Auth: session tokens and argon2 for hashing (helpers in `src/lib/server/auth.ts`)
- Validation: valibot server-side for remote `createEntry`
- Markdown: marked for rendering (client preview). DOMPurify recommended for sanitization.

## Key data model (Drizzle schema)

- user: { id, email, hashed_password, created_at }
- session: { id, userId, token, created_at, expires_at }
- entry: { id, userId, content, mood, created_at, updated_at }
- attachment: { id, entryId?, url, mime_type, uploaded_at }

Notes: attachments may optionally be associated with an entry (stored in `attachment` table) and the entry content may embed attachment URLs (markdown image links or HTML audio tags).

## Core routes / remotes

- `src/routes/journal/data.remote.ts`
  - `listEntries` (query): returns recent entries for the current user (ordered by created_at).
  - `createEntry` (form): server-side valibot validation and DB insert. Exposes `.fields` for native `<form>` mapping and supports `.enhance` on the client.

- `src/routes/journal/+page.server.ts` — load guard that requires authenticated sessions.
- `src/routes/journal/upload/+server.ts` — handles file uploads (images/audio). Should validate file types, size, and user sessions and return stored file paths as JSON.
- `src/routes/journal/entry/*` — handlers for update/delete entry mutations.

## Frontend interactions (what the user sees)

1. Landing on `/journal` (requires login). The page shows:
   - A markdown editor (textarea) with a small toolbar (bold, italic, heading, code).
   - Mood selector (pills or dropdown) to tag the entry.
   - Attachment upload control (file picker; drag & drop optional).
   - Live preview pane rendering the markdown safely.
   - Recent entries list (server-fetched) with mood and timestamp.

2. Creating an entry:
   - The form uses the server remote `createEntry` and progressive enhancement via `createEntry.enhance`.
   - On submit the client performs an optimistic add (shows the new entry immediately), then submits the form. On success the server-provided entries are refetched; on failure an error message is shown.

3. Uploads:
   - Files POSTed to `/journal/upload` and the route returns a JSON with stored URLs.
   - The client appends markdown image links or audio tags into the editor content so the uploaded assets become part of the entry.

4. Entry actions:
   - Delete: client posts `id` to `journal/entry/delete` route and removes the entry from the UI on success.
   - Edit: (future) update flow via `journal/entry/update`.

## Security considerations

- Server-side validation is authoritative. `createEntry` uses `valibot` on the server — never rely on client-side checks.
- Markdown rendering: `marked` is used for client preview. Client currently uses a minimal regex sanitizer that strips `<script>` tags and `on*` attributes. This is insufficient for production. Replace with DOMPurify or sanitize on the server before storing and before sending HTML to clients.
- File uploads: server must validate mime types, check sizes, and store files outside the public folder or sanitize their names and serve them via secure endpoints.
- Sessions: session token validation occurs in `src/lib/server/auth.ts`; ensure secure cookies, appropriate expiry and rotation.

## Current implementation status (what's implemented locally)

- +page.svelte (journal route) — implemented and wired to remote functions.
  - Uses `createEntry` form remote (fields spread to native inputs).
  - Uses `.enhance` to implement progressive enhancement and optimistic UI clearing.
  - Live markdown preview (marked) with a small regex sanitizer.
  - Editor toolbar for basic markdown insertion (bold, italic, heading, code).
  - Mood selection and mood filter in the entries list.
  - Attachment upload UI that POSTs to `/journal/upload` and appends markdown to the editor content.
  - Optimistic local entries displayed while server confirms insertion.
  - Delete action wired to `/journal/entry/delete`.

- Server-side remotes and routes: `listEntries`, `createEntry`, `upload`, and entry delete/update routes exist in the repo and are used by the UI. `createEntry` implements server valibot validation.

## Current issues / work remaining

Priority (recommended order):

1. Sanitization hardening (high): replace the regex with DOMPurify and/or sanitize HTML server-side. This prevents XSS and is critical before production or sharing entries publicly.
2. Fix server-side TypeScript errors (medium): `npm run check` reports TypeScript/drizzle errors in `entry/update` and `entry/delete` handlers and a few implicit-any issues in auth pages. These were present and must be resolved to get a clean CI check.
3. UX polish (low): drag-and-drop uploads, thumbnails, toolbar improvements, autosave drafts, entry edit inline.
4. Tests (medium): unit tests for server remotes and small Playwright e2e tests for the create/list/upload flows.
5. Security: tighten cookie settings, rate-limit uploads, CSRF protections if necessary, and ensure attachments are served securely.

## How to run locally (quick)

1. Install deps:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Run type & Svelte checks:

```bash
npm run check
```

Note: `npm run check` currently reports several server-side TypeScript errors that pre-existed the new page changes. Those need to be fixed to achieve a clean check result.

## Suggested next steps (I can implement any of these)

- Replace the client regex sanitizer with DOMPurify and/or do server-side HTML sanitization before storing and serving entries.
- Fix the Drizzle/TypeScript issues in `src/routes/journal/entry/*` and the small `any` typing issues in auth pages so `npm run check` passes.
- Add tests: Vitest for remotes, Playwright for the journal creation+upload flow.
- Improve upload UX: progress bars, thumbnails, drag-and-drop.

If you want, I can start with DOMPurify integration or fix the server-side TypeScript errors next — tell me which to prioritize and I will implement it and re-run checks.
