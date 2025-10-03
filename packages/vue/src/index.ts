import './assets/index.css'
export { default as ParaportComponent } from './App.vue'

// types
export type { MountOptions, DisplayMode, TeleportEvents } from '@/types'
export { DisplayModes } from '@/types'

// plugins and store
export { installPinia } from '@/plugins/pinia'
export { installi18n } from '@/i18n'
export { useSdkStore } from '@/stores'
export { default as eventBus }  from '@/utils/event-bus'

import { App } from 'vue'
import ParaportApp from './App.vue'
import { installPinia } from '@/plugins/pinia'
import { installi18n } from '@/i18n'

export function install(app: App) {
  app.component('Paraport', ParaportApp)

  installPinia(app)
  installi18n(app)
}

export const Paraport = {
  install,
}

export default Paraport
