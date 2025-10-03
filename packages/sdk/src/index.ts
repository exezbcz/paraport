import '@paraport/vue/style'
import { ParaPortSDK } from '@paraport/core'
import { ParaportComponent, installi18n, installPinia, useSdkStore, eventBus, DisplayModes } from '@paraport/vue'
import type { MountOptions, TeleportEvents, DisplayMode } from '@paraport/vue'
import { createApp, h } from 'vue'

const attachEventListeners = ({
	onSubmit,
	onCompleted,
	onReady,
	onAddFunds,
}: TeleportEvents) => {
	if (onReady) {
		eventBus.on('session:ready', onReady)
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
	displayMode = DisplayModes.Integrated,
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
		chains: undefined,
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
		render: () => h(ParaportComponent),
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
