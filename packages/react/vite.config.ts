import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
       rollupTypes: true,
       include: ['src/**/*'],
       // Ensure we're generating declarations for .tsx files
       entryRoot: 'src',
       tsconfigPath: resolve(__dirname, './tsconfig.app.json'),
       copyDtsFiles: true,
       insertTypesEntry: true,
     }),
    visualizer()
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ParaPortReact',
      fileName: 'index',
      formats: ['es'],
    },
    sourcemap: false,
    watch: {
      clearScreen: false,
      include: ['src/**/*'],
    },
    rollupOptions: {
      external: [
        // React core
        'react',
        'react-dom',
        // Polkadot packages
        '@polkadot/api',
        '@polkadot/extension-dapp',
        '@polkadot/types',
        '@polkadot/util',
        '@polkadot/util-crypto',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        sourcemap: false,
      },
    },
  },
})
