<template>
    <div class="paraport pp-bg-transparent" :style="appearance">
        <IntegratedParaport v-if="displayMode === DisplayModes.Integrated" />
    </div>
</template>

<script setup lang="ts">
import { onUnmounted, watchEffect } from 'vue'
import IntegratedParaport from '@/components/integrated/Integrated.vue'
import useSystemDarkMode from '@/composables/useSystemDarkMode'
import { useSdk } from '@/composables/useSdk'
import {
	type DisplayMode,
	DisplayModes,
	ParaportEvents,
	type ParaportParams,
} from '@/types'
import eventBus from '@/utils/event-bus'
import { ParaPortSDK } from '@paraport/core'

const props = defineProps<ParaportParams>()
const emits = defineEmits<ParaportEvents>()

useSystemDarkMode(props.themeMode ?? 'auto')

const store = useSdk()
const { displayMode, appearance } = useSdk()

const sdk = new ParaPortSDK({
	getSigner: props.getSigner,
	logLevel: props.logLevel,
	endpoints: props.endpoints,
	chains: undefined,
})

store.setSdk(sdk)
store.setTeleportParams({
	chain: props.chain,
	address: props.address,
	asset: props.asset,
	amount: props.amount,
	teleportMode: props.teleportMode,
})

props.ui && store.setUi(props.ui)
props.appearance && store.setAppearance(props.appearance)
store.setDisplayMode(
	props.displayMode || (DisplayModes.Integrated as DisplayMode),
)

watchEffect(() => {
  store.setLabel(props.label || '')
  store.setDisabled(props.disabled || false)
  store.setAppearance(props.appearance)
})

eventBus.on('session:ready', () => emits('completed'))
eventBus.on('session:add-funds', () => emits('addFunds'))
eventBus.on('session:ready', (...args) => emits('ready', ...args))
eventBus.on('teleport:submit', (...args) => emits('submit', ...args))

const destroy = () => {
	store.sdk.value.destroy()
}

onUnmounted(destroy)
</script>
