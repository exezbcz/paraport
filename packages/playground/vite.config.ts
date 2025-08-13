import path from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@paraport/core', '@paraport/ui']
  },
  },
  server: {
    watch: {
      followSymlinks: false
    }
  }
})
