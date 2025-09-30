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
