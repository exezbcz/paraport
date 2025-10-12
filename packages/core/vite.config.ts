import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig(({ mode }) => ({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ParaPortCore',
      formats: ['es'],
      fileName: 'index',
    },
    sourcemap: mode !== 'production',
    watch: {
      clearScreen: false,
      // Watch static so its changes rebuild core during dev
      include: [
        'src/**/*',
        '../static/src/**/*',
        '../static/dist/**/*',
      ],
    },
    rollupOptions: {
      external: [
        'polkadot-api',
        '@paraport/static',
        'lodash',
        'eventemitter3',
        'p-retry',
        'dedot',
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
}))
