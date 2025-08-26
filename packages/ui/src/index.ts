import { type AppProps, DisplayMode, type MountOptions } from '@/types'
import { ParaPortSDK } from '@paraport/core'
import { createApp, h, ref } from 'vue'
import App from './App.vue'
import { i18n } from './i18n'
import eventBus from './utils/event-bus'
import './assets/index.css'

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

export function init({
	integratedTargetId,
	autoteleport,
	onSubmit,
	onCompleted,
	displayMode = DisplayMode.Integrated,
	...options
}: MountOptions) {
	const targetElement = document.querySelector(`#${integratedTargetId}`)

	if (!targetElement) {
		throw new Error(`Target element not found: ${integratedTargetId}`)
	}

	const sdk = new ParaPortSDK({
		getSigner: options.getSigner,
	})

	const label = ref(options.label)
	const disabled = ref(options.disabled)

	const appProps: AppProps = {
		sdk,
		autoteleport,
		label: label.value,
		disabled: disabled.value,
		displayMode: displayMode as DisplayMode,
	}

	const app = createApp({
		setup() {
			attachEventListeners({
				onCompleted,
				onSubmit,
			})
		},
		render: () => h(App, appProps),
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
