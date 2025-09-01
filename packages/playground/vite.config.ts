import { defineConfig } from 'vite'

export default defineConfig({
  optimizeDeps: {
    exclude: ['@paraport/sdk']
  },
  define: {
    'process.env': JSON.stringify({
      GRAPHQL_API_URL: 'https://data.snowbridge.network/graphql'
    })
  },
  server: {
    watch: {
      followSymlinks: false
    }
  }
})
