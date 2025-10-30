/**
 * This script manually inserts migration records into the __drizzle_migrations table.
 * Use this when the database tables exist but the migrations table is empty or out of sync.
 */

import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get database path from environment or use default
const dbPath = process.env.DATABASE_URL || './mood-journal.db';
const db = new Database(dbPath);

// Read the journal to get all migrations
const journalPath = join(__dirname, '../drizzle/meta/_journal.json');
const journal = JSON.parse(readFileSync(journalPath, 'utf-8'));

console.log('Migration Journal:');
console.log('==================');

// Get existing migrations
const existing = db.prepare('SELECT hash FROM __drizzle_migrations').all();
const existingHashes = new Set(existing.map((m) => m.hash));

console.log(`\nFound ${existing.length} existing migrations in database`);
console.log(`Found ${journal.entries.length} migrations in journal\n`);

// Insert each migration from the journal
let inserted = 0;
let skipped = 0;

for (const entry of journal.entries) {
	const snapshotPath = join(
		__dirname,
		`../drizzle/meta/${entry.tag.split('_').slice(0, 1)[0]}_snapshot.json`
	);

	let migrationId;
	try {
		const snapshot = JSON.parse(readFileSync(snapshotPath, 'utf-8'));
		migrationId = snapshot.id;
	} catch {
		console.log(`⚠️  Warning: Could not read snapshot for ${entry.tag}, using tag as hash`);
		migrationId = entry.tag;
	}

	if (existingHashes.has(migrationId)) {
		console.log(`⏭️  Skipped: ${entry.tag} (already exists)`);
		skipped++;
	} else {
		try {
			db.prepare('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)').run(
				migrationId,
				entry.when
			);
			console.log(`✅ Inserted: ${entry.tag} (${migrationId})`);
			inserted++;
		} catch (err) {
			console.error(`❌ Failed to insert ${entry.tag}:`, err.message);
		}
	}
}

console.log(`\n==================`);
console.log(`Summary: ${inserted} inserted, ${skipped} skipped`);
console.log(
	`\nMigrations table now has ${db.prepare('SELECT COUNT(*) as count FROM __drizzle_migrations').get().count} records`
);

db.close();
