<template>
    <div class="flex flex-col items-center justify-center gap-4">
        <div class="flex w-full justify-between items-center" v-if="showAutoTeleport">
            <div >
            </div>

            <Switch
                v-model="enabled"
            />
        </div>

        <Button
            :disabled="isDisabled"
            :label="label"
            @click="submit"
            expanded
        />
    </div>

    <Modal
      v-model="open"
      :teleport="autoteleport"
      @retry="retry"
    />
</template>

<script setup lang="ts">
import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { computed, defineProps, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from './components/Modal.vue'
import Button from './components/ui/Button/Button.vue'
import Switch from './components/ui/Switch/Switch.vue'
import useAutoTeleport from './composables/useAutoTeleport'
import useAutoTeleportButton from './composables/useAutoTeleportButton'
import eventBus from './utils/event-bus'

const props = defineProps<{
	sdk: AutoTeleportSDK
	autoteleport: TeleportParams<string>
	label: string
	disabled?: boolean
}>()

const { t } = useI18n()

const open = ref(false)

const {
	enabled,
	needsAutoTeleport,
	hasEnoughInCurrentChain,
	exec,
	autoteleport,
	retry,
	isAvailable,
	isReady,
	canAutoTeleport,
	hasNoFundsAtAll,
	insufficientFunds,
} = useAutoTeleport(props.sdk, props.autoteleport)

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

const { allowAutoTeleport, showAutoTeleport } = useAutoTeleportButton({
	needsAutoTeleport,
	isAvailable,
	isReady,
	canAutoTeleport,
	hasNoFundsAtAll,
	disabled: isDisabled,
})

const confirmButtonTitle = computed(() => 'confirmButtonTitle')

const label = computed(() => {
	if (hasEnoughInCurrentChain.value || props.disabled) {
		return props.label || confirmButtonTitle.value
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

		return props.label
	}

	return t('checking')
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
