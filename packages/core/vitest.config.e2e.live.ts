import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['e2e/live/**/*.e2e.test.ts'],
    testTimeout: 180_000,
    hookTimeout: 180_000,
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      // Use Node WS provider in live Node tests (no browser WebSocket)
      'polkadot-api/ws-provider/web': 'polkadot-api/ws-provider/node',
    },
  },
})
