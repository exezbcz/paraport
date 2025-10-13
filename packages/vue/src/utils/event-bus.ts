import type { TeleportSessionPayload } from '@paraport/core'

import mitt from 'mitt'

const eventBus = mitt<{
  'session:ready': TeleportSessionPayload
  'session:add-funds': undefined
  'teleport:submit': {
    autoteleport: boolean
    completed: boolean
  }
  'teleport:completed': undefined
}>()

export default eventBus
