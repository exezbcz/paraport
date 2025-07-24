import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import mitt from 'mitt'
import { createApp, h, provide } from 'vue'
import App from './App.vue'
import './styles/index.scss'

export interface MountOptions {
	sdk: AutoTeleportSDK
	target: string | HTMLElement
	autoteleport: TeleportParams
}

export function mount({ target, sdk, autoteleport }: MountOptions) {
	const targetElement =
		typeof target === 'string' ? document.querySelector(target) : target

	if (!targetElement) {
		throw new Error(`Target element not found: ${target}`)
	}

	const eventBus = mitt()

	const app = createApp({
		setup() {
			provide('eventBus', eventBus)
		},
		render: () => h(App, { sdk, autoteleport }),
	})

	app.mount(targetElement)

	return {
		unsubscribe: () => app.unmount(),
		subscribe: eventBus.on,
	}
}
