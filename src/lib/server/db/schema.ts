import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	username: text('username').notNull(),
	email: text('email').notNull(),
	password_hash: text('password_hash').notNull(),
	avatar_url: text('avatar_url'),
	failed_attempts: integer('failed_attempts').default(0).notNull(),
	locked_until: integer('locked_until', { mode: 'timestamp' }).default(new Date(0)).notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const entry = sqliteTable('entry', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	content: text('content').notNull(),
	mood: text('mood').notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
	updated_at: integer('updated_at', { mode: 'timestamp' }).notNull()
});

export const attachment = sqliteTable('attachment', {
	id: text('id').primaryKey(),
	entryId: text('entry_id')
		.notNull()
		.references(() => entry.id),
	filename: text('filename').notNull(),
	mime: text('mime').notNull(),
	size: integer('size').notNull(),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull()
});

export type Session = typeof session.$inferSelect;

export type User = typeof user.$inferSelect;
export type Entry = typeof entry.$inferSelect;
export type Attachment = typeof attachment.$inferSelect;
