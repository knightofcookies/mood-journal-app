import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
	test: {
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		exclude: ['tests/e2e/**']
	},
	resolve: {
		alias: {
			$lib: path.resolve(__dirname, './src/lib'),
			// Provide explicit alias for SvelteKit virtual module in Vitest
			'$app/server': path.resolve(__dirname, './tests/mocks/app-server.ts'),
			'$env/dynamic/private': path.resolve(__dirname, './tests/mocks/env-dynamic-private.ts')
		}
	}
});
