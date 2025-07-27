import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import mitt from 'mitt'
import { createApp, h, provide } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './styles/index.scss'

export interface MountOptions {
	sdk: AutoTeleportSDK
	target: string | HTMLElement
	autoteleport: TeleportParams
}

const enTranslations = {
	autoteleport: {
		steps: {
			1: {
				title: 'Bridging',
			},
			2: {
				title: 'Checking Funds',
			},
		},
		title: 'Sign Transactions',
		status: {
			broadcastingTx: 'Broadcasting tx',
			completed: 'Completed',
			error: 'Failed to Sign',
			finishAbove: 'Finish steps above first',
			loading: 'Transaction in Progress',
			noSignatureRequired: 'Signature not needed',
			uploading: 'Uploading data to IPFS',
			waiting: 'Awaiting Your Signature',
		},
	},
}

export function mount({ target, sdk, autoteleport }: MountOptions) {
	const targetElement =
		typeof target === 'string' ? document.querySelector(target) : target

	if (!targetElement) {
		throw new Error(`Target element not found: ${target}`)
	}

	const eventBus = mitt()

	const i18n = createI18n({
		locale: 'en',
		legacy: false,
		messages: {
			en: enTranslations,
		},
	})

	const app = createApp({
		setup() {
			provide('eventBus', eventBus)
		},
		render: () => h(App, { sdk, autoteleport }),
	})

	app.use(i18n).mount(targetElement)

	return {
		subscribe: eventBus.on,
		destroy: () => app.unmount(),
	}
}
