import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'ParaPortCore',
			formats: ['es'],
			fileName: 'index',
		},
		sourcemap: process.env.NODE_ENV !== 'production',
		watch: {
			clearScreen: false,
			include: ['src/**/*'],
		},
		rollupOptions: {
			external: [
				'@paraport/static',
				'@kodadot1/sub-api',
				'@paraspell/sdk-pjs',
				'@polkadot/util-crypto',
				'lodash',
			plugins: [
				{
					name: 'fix-snowbridge-module',
					/**
					 * This plugin fixes an issue with @snowbridge/api which is a dependency of @paraspell/sdk-pjs.
					 *
					 * Problem: @snowbridge/api uses Node.js specific process.env['GRAPHQL_API_URL'] and
					 * process.env['GRAPHQL_QUERY_SIZE'] variables, which don't exist in browser environments,
					 * causing "ReferenceError: process is not defined" when the library is used in browsers.
					 *
					 * Solution: We replace all instances of process.env with an empty object ({}),
					 * which makes process.env.ANYTHING evaluate to undefined, allowing the library's
					 * fallback values to be used instead.
					 */
					transform(code, id) {
						if (
							id.includes('@snowbridge/api') &&
							code.includes('process.env')
						) {
							const modified = code.replace(/process\.env/g, '({})')

							return {
								code: modified,
								map: { mappings: '' },
							}
						}
						return null
					},
				},
			],
		},
	},
	resolve: {
		alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
	},
	plugins: [
		dts({
			compilerOptions: { preserveWatchOutput: true },
			rollupTypes: true,
		}),
	],
})
