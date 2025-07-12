import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'core',
			formats: ['es'],
		},
		sourcemap: true,

		watch: {
			clearScreen: false,
			include: ['src/**/*'],
		},
	},
	plugins: [
		dts({
			compilerOptions: { preserveWatchOutput: true },
		}),
	],
})
