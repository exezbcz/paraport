<template>
    <div class="paraport">
        <IntegratedParaport v-if="displayMode === DisplayModes.Integrated" />
    </div>
</template>

<script setup lang="ts">
import IntegratedParaport from '@/components/integrated/Integrated.vue'
import useSystemDarkMode from '@/composables/useSystemDarkMode'
import { useSdkStore } from '@/stores'
import {
	type DisplayMode,
	DisplayModes,
	ParaportEvents,
	type ParaportParams,
} from '@/types'
import eventBus from '@/utils/event-bus'
import { ParaPortSDK } from '@paraport/core'
import { storeToRefs } from 'pinia'

const props = defineProps<ParaportParams>()
const emits = defineEmits<ParaportEvents>()

useSystemDarkMode()
const store = useSdkStore()

const { displayMode } = storeToRefs(useSdkStore())

const sdk = new ParaPortSDK({
	getSigner: props.getSigner,
	logLevel: props.logLevel,
	chains: undefined,
})

store.setSdk(sdk)
store.setTeleportParams({
	chain: props.chain,
	address: props.address,
	asset: props.asset,
	amount: props.amount,
	teleportMode: props.teleportMode
})
store.setLabel(props.label || '')
store.setDisabled(props.disabled || false)
store.setDisplayMode(props.displayMode || DisplayModes.Integrated as DisplayMode)

eventBus.on('session:ready', () => emits('completed'))
eventBus.on('session:add-funds', () => emits('addFunds'))
eventBus.on('session:ready', (...args) => emits('ready', ...args))
eventBus.on('teleport:submit', (...args) => emits('submit', ...args))
</script>
