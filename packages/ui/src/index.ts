import type { AutoTeleportSDK, TransferParams } from '@autoteleport/core'
import { createApp } from 'vue'
import Button from './components/Button.vue'

export interface MountOptions {
	sdk: AutoTeleportSDK
	target: string | HTMLElement
	autoteleport: TransferParams
}

export function mount({ target, sdk, autoteleport }: MountOptions): void {
	const targetElement =
		typeof target === 'string' ? document.querySelector(target) : target

	if (!targetElement) {
		throw new Error(`Target element not found: ${target}`)
	}

	const app = createApp(Button, {
		sdk,
		autoteleport,
	})

	app.mount(targetElement)
}
