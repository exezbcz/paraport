import type { App } from 'vue'

import Paraport from './Paraport.vue'
import './assets/index.css'

export { default as Paraport } from './Paraport.vue'

// plugins and store
export { useSdk } from '@/composables/useSdk'
// types
export type { DisplayMode, ParaportEvents, ParaportParams } from '@/types'

export { DisplayModes } from '@/types'

export function install(app: App) {
  app.component('Paraport', Paraport)
}

export const ParaportPlugin = {
  install,
}

export default ParaportPlugin
