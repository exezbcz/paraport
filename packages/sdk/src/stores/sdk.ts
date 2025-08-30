import { DisplayMode } from '@/types'
import type { ParaPortSDK, TeleportParams } from '@paraport/core'
import { defineStore } from 'pinia'
import { type Ref, ref } from 'vue'

export const useSdkStore = defineStore('sdk', () => {
	const sdk = ref() as Ref<ParaPortSDK>
	const params = ref() as Ref<TeleportParams<string>>
	const label = ref<string>('')
	const disabled = ref<boolean>(false)
	const displayMode = ref<DisplayMode>(DisplayMode.Integrated)

	const setSdk = (newSdk: ParaPortSDK) => {
		sdk.value = newSdk
	}

	const setTeleportParams = (teleportParams: TeleportParams<string>) => {
		params.value = teleportParams
	}

	const setLabel = (newLabel: string) => {
		label.value = newLabel
	}

	const setDisabled = (isDisabled: boolean) => {
		disabled.value = isDisabled
	}

	const setDisplayMode = (mode: DisplayMode) => {
		displayMode.value = mode
	}

	return {
		sdk,
		params,
		label,
		disabled,
		displayMode,
		setSdk,
		setTeleportParams,
		setLabel,
		setDisabled,
		setDisplayMode,
	}
})
