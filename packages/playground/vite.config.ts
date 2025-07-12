import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@autoteleport/core': path.resolve(__dirname, '../core/src')
    }
  },
  optimizeDeps: {
    exclude: ['@autoteleport/core']
  },
  server: {
    watch: {
      followSymlinks: false
    }
  }
})
