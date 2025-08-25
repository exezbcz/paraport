<template>
    <TeleportState
        v-if="session?.status === TeleportSessionStatus.Processing && autoteleport"
        :session="session"
        :autoteleport="autoteleport"
        @retry="retry"
    />

    <Container v-else>
        <template #action>
            <Button
                ref="buttonRef"
                :disabled="isDisabled"
                class="w-full"
                @click="submit"
            >
                <div class="inline-flex gap-3 items-center justify-center">
                    <img v-if="showAutoTeleport" src="@/assets/images/paraport_logo.svg">
                    <span class="text-[16px] capitalize font-medium">{{ label }}</span>
                </div>
            </Button>
        </template>
        <template #bottom v-if="showAutoTeleport || session?.status === TeleportSessionStatus.Completed">
            <template v-if="session?.status === TeleportSessionStatus.Completed">
                <div class="flex items-center gap-2">
                    <SuccessIcon />

                    <p class="text-success-text capitalize text-xs">
                        {{ t('autoteleport.successfullyMoved', [ session?.quotes.selected?.asset])}}
                    </p>
                </div>

                <Button
                    variant="pill-success"
                    class="!gap-0"
                >
                    <span>
                        {{ t('viewTx') }}
                    </span>

                    <ArrowUpRight :size="10" />
                </Button>
            </template>
            <template v-else>
                <p class="text-secondary capitalize text-xs">
                    {{ t('autoteleport.required' )}}
                </p>

                <TeleportOverview
                    v-if="session"
                    :button-ref="buttonRef"
                    :session="session"
                />
            </template>
        </template>
    </Container>
</template>

<script setup lang="ts">
import useAutoTeleport from '@/composables/useAutoTeleport'
import useAutoTeleportButton from '@/composables/useAutoTeleportButton'
import { type AppProps } from '@/types'
import eventBus from '@/utils/event-bus'
import { TeleportSessionStatus } from '@paraport/core'
import Button from '@ui/Button/Button.vue'
import { ArrowUpRight } from 'lucide-vue-next'
import { computed, defineProps, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Container from './Container.vue'
import TeleportOverview from './TeleportOverview.vue'
import TeleportState from './TeleportState.vue'
import SuccessIcon from './icon/SuccessIcon.vue'

const props = defineProps<AppProps>()

const buttonRef = ref(null)

const { t } = useI18n()

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

		return t('autoteleport.sign', [props.autoteleport.chain])
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
</script>
