import './assets/index.css'
export { default as Paraport } from './Paraport.vue'

// types
export type { DisplayMode, ParaportParams, ParaportEvents } from '@/types'
export { DisplayModes } from '@/types'

// plugins and store
export { useSdkStore } from '@/stores'

import { installi18n } from '@/i18n'
import { installPinia } from '@/plugins/pinia'
import type { App } from 'vue'
import Paraport from './Paraport.vue'

export function install(app: App) {
	app.component('Paraport', Paraport)

	installPinia(app)
	installi18n(app)
}

export const ParaportPlugin = {
	install,
}

export default ParaportPlugin
