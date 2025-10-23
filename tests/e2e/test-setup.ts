import { test as base, expect, Page } from '@playwright/test';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

// Test database path
const TEST_DB_PATH = './test-mood-journal.db';

// Extend the base test with authentication
const test = base.extend<{
	authenticatedPage: Page;
}>({
	authenticatedPage: async ({ page }: { page: Page }, use: (page: Page) => Promise<void>) => {
		// Set up test database
		const dbUrl = `file:${path.resolve(TEST_DB_PATH)}`;

		// Create test database if it doesn't exist
		if (!fs.existsSync(TEST_DB_PATH)) {
			// Copy the main database for testing
			if (fs.existsSync('./mood-journal.db')) {
				fs.copyFileSync('./mood-journal.db', TEST_DB_PATH);
			}
		}

		// Start the dev server with test database
		const serverProcess = spawn('npm', ['run', 'dev'], {
			detached: true,
			stdio: 'ignore',
			env: { ...process.env, DATABASE_URL: dbUrl, PORT: '5174' }
		});

		// Wait for server to start
		await new Promise((resolve) => setTimeout(resolve, 5000));

		try {
			// Navigate to login page
			await page.goto('http://localhost:5174/auth/login');

			// For now, we'll assume a test user exists or create one
			// In a real setup, you'd seed the database properly
			await page.fill('input[name="email"]', 'test@example.com');
			await page.fill('input[name="password"]', 'password123');
			await page.click('button[type="submit"]');

			// Wait for redirect to journal or handle if user doesn't exist
			try {
				await page.waitForURL('**/journal', { timeout: 5000 });
			} catch {
				// If login fails, try registering first
				await page.goto('http://localhost:5174/auth/register');
				await page.fill('input[name="email"]', 'test@example.com');
				await page.fill('input[name="password"]', 'password123');
				await page.fill('input[name="confirmPassword"]', 'password123');
				await page.click('button[type="submit"]');
				await page.waitForURL('**/journal');
			}

			await use(page);
		} finally {
			// Cleanup
			try {
				process.kill(-serverProcess.pid!);
			} catch (e) {
				// Server might already be stopped
			}
			if (fs.existsSync(TEST_DB_PATH)) {
				fs.unlinkSync(TEST_DB_PATH);
			}
		}
	}
});

export { test, expect };
