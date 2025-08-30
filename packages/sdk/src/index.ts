import { DisplayMode, type MountOptions, type TeleportEvents } from '@/types'
import { ParaPortSDK } from '@paraport/core'
import { createApp, h } from 'vue'
import App from './App.vue'
import { installi18n } from './i18n'
import eventBus from './utils/event-bus'
import './assets/index.css'
import { installPinia } from './plugins/pinia'
import { useSdkStore } from './stores'

const attachEventListeners = ({
	onSubmit,
	onCompleted,
	onReady,
	onAddFunds,
}: TeleportEvents) => {
	if (onReady) {
		eventBus.on('session:ready', () => onReady())
	}

	if (onSubmit) {
		eventBus.on('teleport:submit', (e) => onSubmit(e))
	}

	if (onCompleted) {
		eventBus.on('teleport:completed', () => onCompleted())
	}

	if (onAddFunds) {
		eventBus.on('session:add-funds', () => onAddFunds())
	}
}

export function init({
	integratedTargetId,
	autoteleport,
	onSubmit,
	onCompleted,
	onReady,
	onAddFunds,
	displayMode = DisplayMode.Integrated,
	...options
}: MountOptions) {
	const targetElement = document.querySelector(`#${integratedTargetId}`)

	if (!targetElement) {
		throw new Error(`Target element not found: ${integratedTargetId}`)
	}

	if (!autoteleport) {
		throw new Error('Teleport Params is required')
	}

	const sdk = new ParaPortSDK({
		getSigner: options.getSigner,
		logLevel: options.logLevel,
	})

	const app = createApp({
		setup() {
			const store = useSdkStore()

			store.setSdk(sdk)
			store.setTeleportParams(autoteleport)
			store.setLabel(options.label || '')
			store.setDisabled(options.disabled || false)
			store.setDisplayMode(displayMode as DisplayMode)

			attachEventListeners({
				onCompleted,
				onSubmit,
				onReady,
				onAddFunds,
			})
		},
		render: () => h(App),
	})

	// install plugins
	installPinia(app)
	installi18n(app)

	app.mount(targetElement)

	return {
		update: (options: Pick<MountOptions, 'label' | 'disabled'>) => {
			const store = useSdkStore()
			if (options.label !== undefined) store.setLabel(options.label)
			if (options.disabled !== undefined) store.setDisabled(options.disabled)
		},
		destroy: () => app.unmount(),
	}
}
