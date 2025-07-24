import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [vue(), dts({ rollupTypes: true })],
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'AutoTeleportUI',
			fileName: 'index',
			formats: ['es'],
		},
		sourcemap: true,
		watch: {
			clearScreen: false,
			include: ['src/**/*'],
		},
		rollupOptions: {
			external: ['vue', '@autoteleport/core', '@oruga-ui/oruga-next'],
			output: {
				assetFileNames: (assetInfo) => {
					if (assetInfo.name === 'style.css') return 'index.css'
					return assetInfo.name
				},
			},
		},
		cssCodeSplit: false,
	},
})
