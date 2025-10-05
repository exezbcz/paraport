import '@paraport/vue/style'
import { ParaportComponent, installi18n, installPinia, useSdkStore, DisplayModes } from '@paraport/vue'
import type { MountOptions } from './types'
import { createApp, h } from 'vue'

export function init({
	integratedTargetId,
	amount,
	chain,
	address,
	asset,
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

	const app = createApp({
		render: () => h(ParaportComponent, {
        chain,
        amount,
        address,
        asset,
        displayMode,
        logLevel: options.logLevel,
        label: options.label,
        disabled: options.disabled,
        onReady,
        onAddFunds,
        onCompleted,
        onSubmit
		}),
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
