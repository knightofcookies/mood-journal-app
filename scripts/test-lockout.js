#!/usr/bin/env node
/*
Simple integration test for lockout behavior.
Assumes the dev server is running at http://localhost:5173
and the SQLite DB file is at ./mood-journal.db (project root).

This script will:
 - Register a test user
 - Attempt N failed logins
 - Check the `user` table for failed_attempts and locked_until
 - Perform a successful login and verify counters reset

Run: node scripts/test-lockout.js
*/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import Database from 'better-sqlite3';

const ROOT = path.resolve(new URL(import.meta.url).pathname, '..', '..');
const DB_PATH = path.join(ROOT, 'mood-journal.db');
const BASE = 'http://localhost:5173';

function wait(ms) {
	return new Promise((r) => setTimeout(r, ms));
}

async function main() {
	if (!fs.existsSync(DB_PATH)) {
		console.error('DB file not found at', DB_PATH);
		process.exit(2);
	}

	// Open writable so the test can manipulate the lock for deterministic verification
	const db = new Database(DB_PATH);

	const testUser = `test_user_${Date.now()}`;
	const email = `${testUser}@example.com`;
	const password = 'CorrectHorseBatteryStaple!1';

	console.log('Registering user', testUser);
	const regBody = new URLSearchParams();
	regBody.append('username', testUser);
	regBody.append('email', email);
	regBody.append('password', password);

	const reg = await fetch(`${BASE}/auth/register`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
		body: regBody.toString()
	});
	let regText = await reg.text();
	try {
		const parsed = JSON.parse(regText);
		console.log('Register response:', reg.status, JSON.stringify(parsed).slice(0, 200));
	} catch {
		console.log('Register response:', reg.status, regText.slice(0, 200));
	}
	await wait(300);

	const getUser = (u) =>
		db
			.prepare(
				'SELECT id, username, email, failed_attempts, locked_until FROM user WHERE username = ?'
			)
			.get(u);

	let row = getUser(testUser);
	if (!row) {
		console.error('User not found in DB after registration');
		process.exit(3);
	}
	console.log('User created in DB id=', row.id);

	const attempts = 6; // threshold is 5 in server logic
	for (let i = 1; i <= attempts; i++) {
		const bad = new URLSearchParams();
		bad.append('email', email);
		bad.append('password', 'wrong-password');
		const res = await fetch(`${BASE}/auth/login`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
			body: bad.toString()
		});
		const bodyText = await res.text();
		let body = bodyText;
		try {
			body = JSON.parse(bodyText);
		} catch {
			// keep raw
		}
		console.log(
			`Failed attempt ${i}:`,
			res.status,
			typeof body === 'string' ? body.slice(0, 200) : JSON.stringify(body).slice(0, 200)
		);
		await wait(200);
	}

	row = getUser(testUser);
	console.log('After failed attempts:', {
		failed_attempts: row.failed_attempts,
		locked_until: row.locked_until
	});

	if (row.failed_attempts < 5) {
		console.error('failed_attempts did not reach threshold');
		process.exit(4);
	}

	// Note: Do NOT mutate DB here in the general test. For local dev deterministic runs use scripts/test-lockout-dev.js
	// If you want deterministic local runs, run `node scripts/test-lockout-dev.js` instead.

	console.log('Attempting successful login');
	const loginParams = new URLSearchParams();
	loginParams.append('email', email);
	loginParams.append('password', password);
	const good = await fetch(`${BASE}/auth/login`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
		body: loginParams.toString()
	});
	const goodText = await good.text();
	let goodBody = goodText;
	try {
		goodBody = JSON.parse(goodText);
	} catch {
		// ignore
	}
	console.log(
		'Successful login response status:',
		good.status,
		typeof goodBody === 'string' ? goodBody.slice(0, 200) : JSON.stringify(goodBody).slice(0, 200)
	);
	await wait(200);
	await wait(200);

	// Read DB locally
	row = getUser(testUser);
	console.log('After success:', {
		failed_attempts: row.failed_attempts,
		locked_until: row.locked_until
	});

	// call server-side debug endpoint to get the server's view (always run so we can debug failures)
	try {
		const dbg = new URLSearchParams();
		dbg.append('email', email);
		const srv = await fetch(`${BASE}/_internal/user-debug`, {
			method: 'POST',
			body: dbg.toString(),
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
		});
		const srvBody = await srv.text();
		console.log('Server debug endpoint response:', srv.status, srvBody.slice(0, 400));
	} catch (err) {
		console.error('Error calling server debug endpoint', err);
	}

	if (row.failed_attempts !== 0) {
		console.error('failed_attempts not reset after successful login');
		process.exit(5);
	}

	console.log('Lockout test passed.');
	process.exit(0);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
