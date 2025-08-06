import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { createApp, h, ref } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
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
	...options
}: MountOptions) {
	const targetElement =
		typeof target === 'string' ? document.querySelector(target) : target

	if (!targetElement) {
		throw new Error(`Target element not found: ${target}`)
	}

	const label = ref(options.label)
	const disabled = ref(false)

	const app = createApp({
		setup() {
			attachEventListeners({ onCompleted, onSubmit })
		},
		render: () =>
			h(App, {
				sdk,
				autoteleport,
				label: label.value,
				disabled: disabled.value,
			}),
	})

	app.use(i18n).mount(targetElement)

	return {
		updateLabel: (value: string) => {
			label.value = value
		},
		updateDisabled: (value: boolean) => {
			disabled.value = value
		},
		destroy: () => app.unmount(),
	}
}
