import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [react(), vue()],
  optimizeDeps: {
    exclude: ['@paraport/sdk', '@paraport/react', '@paraport/vue']
  },
  server: {
    fs: {
      // Allow serving files from the monorepo root and packages for HMR
      allow: ['..', '../..']
    },
    watch: {
      // Follow symlinks so workspace packages trigger HMR
      followSymlinks: true
    }
  }
})
