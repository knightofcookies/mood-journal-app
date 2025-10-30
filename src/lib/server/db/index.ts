import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { env } from '$env/dynamic/private';
import fs from 'fs';
import path from 'path';

// Validate DATABASE_URL is set
if (!env.DATABASE_URL) {
	throw new Error('DATABASE_URL environment variable is required');
}

const dbPath = env.DATABASE_URL;

// Ensure database directory exists
try {
	const dbDir = path.dirname(dbPath);
	if (!fs.existsSync(dbDir)) {
		console.log(`[db] Creating database directory: ${dbDir}`);
		fs.mkdirSync(dbDir, { recursive: true, mode: 0o755 });
	}
} catch (error) {
	console.error('[db] Failed to create database directory:', error);
	throw new Error(`Failed to initialize database directory: ${error}`);
}

// Initialize database with error handling
let client: Database.Database;
try {
	client = new Database(dbPath, {
		// Enable Write-Ahead Logging for better concurrency
		// and crash recovery
		verbose: env.NODE_ENV === 'development' ? console.log : undefined
	});

	// Configure SQLite for better performance and safety
	client.pragma('journal_mode = WAL');
	client.pragma('synchronous = NORMAL');
	client.pragma('foreign_keys = ON');
	client.pragma('busy_timeout = 5000'); // 5 second timeout for locks

	// Test connection
	const result = client.prepare('SELECT 1').get();
	if (!result) {
		throw new Error('Database connection test failed');
	}

	console.log('[db] Database connection established successfully');
} catch (error) {
	console.error('[db] Failed to initialize database:', error);
	throw new Error(`Database initialization failed: ${error}`);
}

// Create drizzle instance
export const db = drizzle(client, { schema });

// Graceful shutdown handler
function closeDatabase() {
	try {
		if (client) {
			client.close();
			console.log('[db] Database connection closed');
		}
	} catch (error) {
		console.error('[db] Error closing database:', error);
	}
}

// Register cleanup handlers
process.on('SIGINT', () => {
	closeDatabase();
	process.exit(0);
});

process.on('SIGTERM', () => {
	closeDatabase();
	process.exit(0);
});

// Export helper for testing and manual cleanup
export { closeDatabase };
