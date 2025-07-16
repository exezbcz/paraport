import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import mitt from 'mitt'
import { createApp, h, provide } from 'vue'
import Button from './components/Button.vue'

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
		render: () => h(Button, { sdk, autoteleport }),
	})

	app.mount(targetElement)

	return {
		unsubscribe: () => app.unmount(),
		subscribe: eventBus.on,
	}
}
