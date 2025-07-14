import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'AutoTeleportCore',
			formats: ['es'],
			fileName: 'index',
		},
		sourcemap: true,
		watch: {
			clearScreen: false,
			include: ['src/**/*'],
		},
		rollupOptions: {
			external: [
				'@kodadot1/static',
				'@kodadot1/sub-api',
				'@paraspell/sdk-pjs',
				'@polkadot/util-crypto',
				'lodash',
			],
		},
	},
	plugins: [
		dts({
			compilerOptions: { preserveWatchOutput: true },
			rollupTypes: true,
		}),
	],
})
