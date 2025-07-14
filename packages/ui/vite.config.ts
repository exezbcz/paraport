import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({ rollupTypes: true })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AutoTeleportUI',
      fileName: 'index',
      formats: ['es']
    },
    sourcemap: true,
    watch: {
      clearScreen: false,
      include: ['src/**/*']
    },
    rollupOptions: {
      external: ['vue', '@autoteleport/core']
    }
  }
})
