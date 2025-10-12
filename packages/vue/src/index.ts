import './assets/index.css'
export { default as Paraport } from './Paraport.vue'

// types
export type { DisplayMode, ParaportParams, ParaportEvents } from '@/types'
export { DisplayModes } from '@/types'

// plugins and store
export { useSdk } from '@/composables/useSdk'

import type { App } from 'vue'
import Paraport from './Paraport.vue'

export function install(app: App) {
	app.component('Paraport', Paraport)
}

export const ParaportPlugin = {
	install,
}

export default ParaportPlugin
