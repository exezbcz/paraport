<template>
    <TeleportState v-if="session?.status === TeleportSessionStatus.Processing && autoteleport" :autoteleport="autoteleport" />

    <TeleportButtonSkeleton v-else-if="!isReady" />

    <div v-else class="flex flex-col items-center justify-center relative">

        <Button
            :disabled="isDisabled"
            class="w-full !rounded-xl"
            @click="submit"
        >
            {{ label }}
        </Button>


        <div
            class="mt-2 capitalize flex gap-1 text-xs"
            v-if="showAutoTeleport"
        >
            <span>Uses</span>
            <span class="font-bold">ParaPort</span>
            <span> {{ $t('toMove', [ props.autoteleport.asset, props.autoteleport.chain ])}} </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from '@/components/ui/Button/Button.vue'
import useAutoTeleport from '@/composables/useAutoTeleport'
import useAutoTeleportButton from '@/composables/useAutoTeleportButton'
import { type AppProps } from '@/types'
import eventBus from '@/utils/event-bus'
import { TeleportSessionStatus } from '@paraport/core'
import { computed, defineProps, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import TeleportButtonSkeleton from './TeleportButtonSkeleton.vue'
import TeleportState from './TeleportState.vue'

const props = defineProps<Exclude<AppProps, 'displayMode'>>()

const { t } = useI18n()

const open = ref(false)

const {
	enabled,
	needsAutoTeleport,
	hasEnoughInCurrentChain,
	exec,
	autoteleport,
	retry,
	session,
	isAvailable,
	isReady,
	canAutoTeleport,
	hasNoFundsAtAll,
	insufficientFunds,
} = useAutoTeleport(props.sdk, props.autoteleport)

const { allowAutoTeleport, showAutoTeleport } = useAutoTeleportButton({
	needsAutoTeleport,
	isAvailable,
	isReady,
	canAutoTeleport,
	hasNoFundsAtAll,
	disabled: computed(() => props.disabled),
})

const label = computed(() => {
	if (hasEnoughInCurrentChain.value || props.disabled) {
		return props.label
	}

	if (insufficientFunds.value) {
		return t('autoteleport.insufficientFunds')
	}

	if (!isReady.value) {
		return t('autoteleport.checking')
	}

	if (allowAutoTeleport.value) {
		if (!enabled.value) {
			return t('autoteleport.notEnoughTokenInChain', [
				props.autoteleport.asset,
				props.autoteleport.chain,
			])
		}

		return t('autoteleport.sign')
	}
})

const isDisabled = computed(() => {
	if (props.disabled || !isReady.value || insufficientFunds.value) {
		return true
	}

	if (hasEnoughInCurrentChain.value) {
		return false
	}

	if (needsAutoTeleport.value) {
		return !enabled.value
	}

	return true
})

const submit = async () => {
	eventBus.emit('teleport:submit', needsAutoTeleport.value)

	if (needsAutoTeleport.value) {
		await exec()
	}
}

watchEffect(() => {
	if (autoteleport.value) {
		open.value = true
	}
})
</script>
