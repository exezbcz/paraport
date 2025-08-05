import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { createApp, h } from 'vue'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import './styles/index.scss'
import eventBus from './utils/event-bus'

export interface MountOptions {
	sdk: AutoTeleportSDK
	target: string | HTMLElement
	autoteleport: TeleportParams<string>
	onSubmit?: (autotelport: boolean) => void
	onCompleted?: () => void
	label: string
}

const enTranslations = {
	autoteleport: {
		checking: 'Checking Funds ...',
		insufficientFunds: 'Insufficient Funds',
		notEnoughTokenInChain: 'Not enough {0} on {1}',
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
	loading: 'Loading...',
	teleport: 'Teleport',
}

const attachEventListeners = ({
	onSubmit,
	onCompleted,
}: Pick<MountOptions, 'onCompleted' | 'onSubmit'>) => {
	if (onSubmit) {
		eventBus.on('teleport:submit', (e) => onSubmit(e))
	}

	if (onCompleted) {
		eventBus.on('teleport:completed', () => onCompleted())
	}
}

export function mount({
	target,
	sdk,
	autoteleport,
	onSubmit,
	onCompleted,
	label,
}: MountOptions) {
	const targetElement =
		typeof target === 'string' ? document.querySelector(target) : target

	if (!targetElement) {
		throw new Error(`Target element not found: ${target}`)
	}

	const i18n = createI18n({
		locale: 'en',
		legacy: false,
		messages: {
			en: enTranslations,
		},
	})

	const app = createApp({
		setup() {
			attachEventListeners({ onCompleted, onSubmit })
		},
		render: () => h(App, { sdk, autoteleport, label }),
	})

	app.use(i18n).mount(targetElement)

	return {
		subscribe: eventBus.on,
		destroy: () => app.unmount(),
	}
}
