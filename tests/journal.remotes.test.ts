/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, beforeAll, vi } from 'vitest';

// Minimal harness to call the remote functions directly
import * as data from '../src/routes/journal/data.remote';

// Mock $app/server virtual module
vi.mock('$app/server', () => ({
	query: vi.fn((fn) => fn),
	form: vi.fn((_schema, fn) => fn),
	getRequestEvent: vi.fn(() => ({
		locals: {
			user: { id: 'u1', username: 'test' }
		},
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
			insert: (_tbl: any) => ({
				values: async (val: any) => {
					rows.push(val);
				}
			}),
			select: (_shape?: any) => ({
				from: (_tbl?: any) => ({
					orderBy: () => ({
						limit: async () => Promise.resolve([...rows])
					}),
					innerJoin: () => ({
						where: async () => []
					}),
					where: () => ({
						limit: async () => []
					})
				})
			})
		}
	};
});

// Mock schema objects used by the remote
vi.mock('../src/lib/server/db/schema', async () => {
	return {
		entry: {
			id: { __col: 'id' },
			userId: { __col: 'userId' },
			content: { __col: 'content' },
			mood: { __col: 'mood' },
			sentimentLabel: { __col: 'sentimentLabel' },
			sentimentScore: { __col: 'sentimentScore' },
			createdAt: { __col: 'createdAt' },
			updatedAt: { __col: 'updatedAt' }
		},
		entryTag: {
			entryId: { __col: 'entryId' },
			tagId: { __col: 'tagId' },
			createdAt: { __col: 'createdAt' }
		},
		tag: {
			id: { __col: 'id' },
			name: { __col: 'name' },
			type: { __col: 'type' },
			createdAt: { __col: 'createdAt' }
		},
		aiSettings: {
			userId: { __col: 'userId' }
		}
	};
});

// Mock drizzle helpers
vi.mock('drizzle-orm', async () => ({
	desc: (x: any) => x,
	eq: (..._args: any[]) => true,
	inArray: (..._args: any[]) => true
}));

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
