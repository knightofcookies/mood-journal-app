#!/usr/bin/env node
/*
Integration harness (standalone) for lockout/reset behavior.
Creates a temporary SQLite DB, seeds a user, simulates failed logins, then performs the atomic reset+session insert
using the same better-sqlite3 transaction style we use in the app.
Run: npm run test:integration
*/

import fs from 'fs';
import os from 'os';
import path from 'path';
import Database from 'better-sqlite3';
import { randomUUID, createHash } from 'node:crypto';
import argon2 from 'argon2';

async function main() {
	const tmpDir = os.tmpdir();
	const dbPath = path.join(tmpDir, `mood-journal-test-${Date.now()}.db`);
	console.log('Creating temp DB at', dbPath);

	const db = new Database(dbPath);

	// create minimal tables
	db.exec(`
    CREATE TABLE user (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      email TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      failed_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE session (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
  `);

	const id = randomUUID();
	const username = 'test_integ_user';
	const email = 'test-integ@example.com';
	const password = 'CorrectHorseBatteryStaple!1';
	const createdAt = Date.now();

	const passwordHash = await argon2.hash(password);

	db.prepare(
		'INSERT INTO user (id, username, email, password_hash, failed_attempts, locked_until, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
	).run(id, username, email, passwordHash, 0, 0, createdAt);

	console.log('Seeded user', id);

	// simulate failed attempts
	const LOCK_THRESHOLD = 5;
	const LOCK_MINUTES = 15;

	for (let i = 1; i <= LOCK_THRESHOLD + 1; i++) {
		// increment
		const row = db.prepare('SELECT failed_attempts FROM user WHERE id = ?').get(id);
		const attempts = row.failed_attempts + 1;
		if (attempts >= LOCK_THRESHOLD) {
			const lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
			db.prepare('UPDATE user SET failed_attempts = ?, locked_until = ? WHERE id = ?').run(
				attempts,
				lockedUntil,
				id
			);
		} else {
			db.prepare('UPDATE user SET failed_attempts = ? WHERE id = ?').run(attempts, id);
		}
	}

	let row = db.prepare('SELECT failed_attempts, locked_until FROM user WHERE id = ?').get(id);
	console.log('After failed attempts:', row);
	if (row.failed_attempts < LOCK_THRESHOLD) {
		console.error('Failed attempts did not reach threshold');
		process.exit(2);
	}

	// Now simulate successful login and run atomic reset+session creation transaction
	const token = randomUUID();
	const sessionId = createHash('sha256').update(token).digest('hex');
	const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;

	const trx = db.transaction((sid, uid, expMs) => {
		db.prepare('UPDATE user SET failed_attempts = ?, locked_until = ? WHERE id = ?').run(0, 0, uid);
		db.prepare('INSERT INTO session (id, user_id, expires_at) VALUES (?, ?, ?)').run(
			sid,
			uid,
			expMs
		);
	});

	trx(sessionId, id, expiresAt);

	row = db.prepare('SELECT failed_attempts, locked_until FROM user WHERE id = ?').get(id);
	console.log('After reset transaction:', row);

	if (row.failed_attempts !== 0) {
		console.error('FAILED: failed_attempts not reset');
		process.exit(3);
	}

	const sess = db
		.prepare('SELECT id, user_id, expires_at FROM session WHERE id = ?')
		.get(sessionId);
	if (!sess) {
		console.error('FAILED: session not created');
		process.exit(4);
	}

	console.log('Integration test passed. Cleaning up.');
	db.close();
	try {
		fs.unlinkSync(dbPath);
	} catch {
		// ignore
	}
	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
