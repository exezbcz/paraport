import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['@paraport/sdk', '@paraport/react']
  },
  server: {
    watch: {
      followSymlinks: false
    }
  }
})
