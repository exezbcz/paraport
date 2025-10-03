import path, { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
	plugins: [vue(), dts({ rollupTypes: true })],
	css: {
		postcss: {
			plugins: [tailwind(), autoprefixer()],
		},
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'~': path.resolve(__dirname, './src'),
			'@components': path.resolve(__dirname, './src/components'),
			'@lib': path.resolve(__dirname, './src/lib'),
			'@utils': path.resolve(__dirname, './src/utils'),
			'@composables': path.resolve(__dirname, './src/composables'),
			'@ui': path.resolve(__dirname, './src/components/ui'),
		},
	},
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'ParaPortVue',
			fileName: 'index',
			formats: ['es'],
		},
		sourcemap: process.env.NODE_ENV !== 'production',
		watch: {
			clearScreen: false,
			include: ['src/**/*'],
		},
		rollupOptions: {
		  external: ['vue', '@paraport/core'],
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
