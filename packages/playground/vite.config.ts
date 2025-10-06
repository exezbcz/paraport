import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [react(), vue()],
  optimizeDeps: {
    exclude: ['@paraport/sdk', '@paraport/react', '@paraport/vue']
  },
  server: {
    watch: {
      followSymlinks: false
    }
  }
})
