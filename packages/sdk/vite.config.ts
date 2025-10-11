import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ParaportSDK',
      fileName: 'index',
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: [
        'vue',
        '@polkadot/api',
        '@polkadot/extension-dapp',
        '@polkadot/types',
        '@polkadot/util',
        '@polkadot/util-crypto'
      ],
      output: {
        globals: {
          vue: 'Vue',
          '@polkadot/api': 'polkadotApi',
          '@polkadot/extension-dapp': 'polkadotExtensionDapp',
          '@polkadot/types': 'polkadotTypes',
          '@polkadot/util': 'polkadotUtil',
          '@polkadot/util-crypto': 'polkadotUtilCrypto'
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
    dts({ rollupTypes: true })
  ]
})
