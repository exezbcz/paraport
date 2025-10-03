import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ParaportSDK',
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'vue',
        '@paraport/vue',
        '@paraport/core'
      ],
      output: {
        globals: {
          vue: 'Vue',
          '@paraport/vue': 'ParaportVue',
          '@paraport/core': 'ParaportCore'
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'index.css'
          return assetInfo.name as string
        }
      }
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    dts()
  ]
})
