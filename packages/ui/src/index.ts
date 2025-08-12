import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { createApp, h, ref } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
import './assets/index.css'
import type { DisplayMode } from '@/types'
import eventBus from './utils/event-bus'

export interface MountOptions {
	sdk: AutoTeleportSDK
	target: string | HTMLElement
	displayMode?: DisplayMode
	autoteleport: TeleportParams<string>
	onSubmit?: (autotelport: boolean) => void
	onCompleted?: () => void
	label: string
	disabled?: boolean
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
	displayMode = 'integrated',
	...options
}: MountOptions) {
	const targetElement =
		typeof target === 'string' ? document.querySelector(target) : target

	if (!targetElement) {
		throw new Error(`Target element not found: ${target}`)
	}

	const label = ref(options.label)
	const disabled = ref(options.disabled)

	const app = createApp({
		setup() {
			attachEventListeners({
				onCompleted: () => {
					app.unmount()
					onCompleted?.()
				},
				onSubmit,
			})
		},
		render: () =>
			h(App, {
				sdk,
				autoteleport,
				label: label.value,
				disabled: disabled.value,
				displayMode,
			}),
	})

	app.use(i18n).mount(targetElement)

	return {
		update: (options: Pick<MountOptions, 'label' | 'disabled'>) => {
			if (options.label !== undefined) label.value = options.label
			if (options.disabled !== undefined) disabled.value = options.disabled
		},
		destroy: () => app.unmount(),
	}
}
