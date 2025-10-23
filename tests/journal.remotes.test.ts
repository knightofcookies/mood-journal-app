import { describe, it, expect, beforeAll, vi } from 'vitest';

// Minimal harness to call the remote functions directly
import * as data from '../src/routes/journal/data.remote';

// Mock $app/server virtual module
vi.mock('$app/server', () => ({
	query: vi.fn((fn) => fn),
	form: vi.fn((schema, fn) => fn),
	getRequestEvent: vi.fn(() => ({
		cookies: {
			get: (k: string) => (k === 'auth-session' ? 'test-token' : null)
		},
		getClientAddress: vi.fn(() => '127.0.0.1')
	}))
}));

// Mock auth to always validate a fixed user
vi.mock('../src/lib/server/auth', async () => {
	return {
		validateSessionToken: async (_token: string) => ({
			session: { id: 's1', userId: 'u1', expiresAt: new Date(Date.now() + 3600_000) },
			user: { id: 'u1', username: 'test' }
		})
	};
});

// Mock rate limit
vi.mock('../src/lib/server/rateLimit', () => ({
	allow: vi.fn(async () => true)
}));

// Mock db with in-memory arrays
const rows: any[] = [];
vi.mock('../src/lib/server/db', async () => {
	return {
		db: {
			insert: (tbl: any) => ({
				values: async (val: any) => {
					rows.push(val);
				}
			}),
			select: () => ({
				from: () => ({ orderBy: () => ({ limit: () => Promise.resolve([...rows]) }) })
			})
		}
	};
});

// Mock schema objects used by the remote
vi.mock('../src/lib/server/db/schema', async () => {
	return {
		entry: {}
	};
});

// Mock drizzle desc
vi.mock('drizzle-orm', async () => ({ desc: (x: any) => x }));

describe('journal remotes', () => {
	beforeAll(() => {
		rows.length = 0;
	});

	it('createEntry inserts a row', async () => {
		const res = await data.createEntry({ content: 'hello', mood: 'happy' } as any);
		expect(res).toHaveProperty('id');
		expect(rows.length).toBe(1);
		expect(rows[0].content).toBe('hello');
	});

	it('listEntries returns recent entries', async () => {
		const list = await data.listEntries();
		expect(Array.isArray(list)).toBe(true);
	});
});
