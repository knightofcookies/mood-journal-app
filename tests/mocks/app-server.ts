/* eslint-disable @typescript-eslint/no-explicit-any */
// Vitest mock for SvelteKit's $app/server virtual module
// Provides minimal stubs used by our remote functions during unit tests

export const query = (fn: any) => fn;
export const form = (_schema: any, fn: any) => fn;

export const getRequestEvent = () => ({
	locals: {
		user: { id: 'u1', username: 'test' }
	},
	cookies: {
		get: (k: string) => (k === 'auth-session' ? 'test-token' : null)
	},
	getClientAddress: () => '127.0.0.1'
});
