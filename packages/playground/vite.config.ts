import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@paraport/sdk']
  },
  server: {
    watch: {
      followSymlinks: false
    }
  }
})
