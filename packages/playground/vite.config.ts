import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@autoteleport/core', '@autoteleport/ui']
  },
  },
  server: {
    watch: {
      followSymlinks: false
    }
  }
})
