import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		include: ['e2e/*.test.ts'],
		testTimeout: 60000,
		hookTimeout: 60000,
		poolOptions: {
			threads: {
				singleThread: true,
			},
		},
	},
	resolve: {
		alias: {
			'@': resolve(__dirname, './src'),
		},
	},
})
