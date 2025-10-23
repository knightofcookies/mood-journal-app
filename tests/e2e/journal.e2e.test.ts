import { test, expect } from '@playwright/test';

test('journal page loads', async ({ page }) => {
	const timestamp = Date.now();
	const email = `test${timestamp}@example.com`;
	const username = `testuser${timestamp}`;

	await page.goto('/auth/register');

	// Register a test user
	await page.fill('input[name="username"]', username);
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', 'password123');
	await page.click('button[type="submit"]');

	// Should redirect to journal
	await expect(page).toHaveURL('/journal');
	await expect(page.locator('h1')).toContainText('Journal');
});

test('create entry', async ({ page }) => {
	const timestamp = Date.now();
	const email = `test${timestamp}@example.com`;
	const username = `testuser${timestamp}`;

	// Register first
	await page.goto('/auth/register');
	await page.fill('input[name="username"]', username);
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', 'password123');
	await page.click('button[type="submit"]');
	await expect(page).toHaveURL('/journal');

	// Fill out the form
	await page.fill('textarea[name="content"]', 'Test entry content from E2E');
	await page.selectOption('select[name="mood"]', 'happy');

	// Submit the form
	await page.click('button[type="submit"]');

	// Wait for the entry to appear
	await expect(page.locator('text=Test entry content from E2E')).toBeVisible();
});

test('search entries', async ({ page }) => {
	const timestamp = Date.now();
	const email = `test${timestamp}@example.com`;
	const username = `testuser${timestamp}`;

	// Register first
	await page.goto('/auth/register');
	await page.fill('input[name="username"]', username);
	await page.fill('input[name="email"]', email);
	await page.fill('input[name="password"]', 'password123');
	await page.click('button[type="submit"]');
	await expect(page).toHaveURL('/journal');

	// Create an entry first
	await page.fill('textarea[name="content"]', 'Test entry content from E2E');
	await page.selectOption('select[name="mood"]', 'happy');
	await page.click('button[type="submit"]');
	await expect(page.locator('text=Test entry content from E2E')).toBeVisible();

	// Search for the entry we created
	await page.fill('input[type="search"]', 'E2E');
	await expect(page.locator('text=Test entry content from E2E')).toBeVisible();

	// Search for something that doesn't exist
	await page.fill('input[type="search"]', 'nonexistent');
	await expect(page.locator('text=No entries yet.')).toBeVisible();
});
