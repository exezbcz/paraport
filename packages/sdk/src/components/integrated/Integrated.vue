<template>
    <IntegratedProgress
        v-if="session?.status === TeleportSessionStatus.Processing && autoteleport"
        :session="session"
        :autoteleport="autoteleport"
        @retry="retry"
    />

    <IntegratedLoading v-else-if="!isReady" />

    <Container v-else>
        <template #action>
            <Button
                ref="buttonRef"
                :disabled="isDisabled"
                class="w-full"
                @click="submit"
            >
                <div class="inline-flex gap-3 items-center justify-center">
                    <img v-if="showAutoTeleport" :src="logoSrc" class="w-[20px]" alt="Paraport Logo">
                    <span class="text-[16px] capitalize font-medium">{{ label }}</span>
                </div>
            </Button>
        </template>
        <template #bottom v-if="showAutoTeleport || isCompleted || insufficientFunds">
            <template v-if="isCompleted">
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
            <template v-else-if="insufficientFunds">
                <p class="text-secondary capitalize text-xs">
                    {{ t('autoteleport.insufficientAssetBalance', [ props.autoteleport?.asset ]) }}
                </p>

                <Button variant="pill-blue" @click="onAddFunds">
                    <span>{{ t('addFunds') }}</span>
                </Button>
            </template>
            <template v-else-if="showAutoTeleport">
                <p class="text-secondary capitalize text-xs">
                    {{ t('autoteleport.required' )}}
                </p>

                <TeleportOverview
                    v-if="session && buttonRef"
                    :button-ref="buttonRef"
                    :session="session"
                />
            </template>
        </template>
    </Container>
</template>

<script setup lang="ts">
import logoLight from '@/assets/images/paraport_logo.svg'
import logoDark from '@/assets/images/paraport_logo_dark.svg'
import useAutoTeleport from '@/composables/useAutoTeleport'
import useAutoTeleportButton from '@/composables/useAutoTeleportButton'
import { useSdkStore } from '@/stores'
import eventBus from '@/utils/event-bus'
import { TeleportSessionStatus, getChainName } from '@paraport/core'
import Button from '@ui/Button/Button.vue'
import { useDark } from '@vueuse/core'
import { ArrowUpRight } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Container from './Container.vue'
import IntegratedLoading from './IntegratedLoading.vue'
import IntegratedProgress from './IntegratedProgress.vue'
import TeleportOverview from './TeleportOverview.vue'
import SuccessIcon from './icon/SuccessIcon.vue'

const {
	label: sdkLabel,
	disabled: sdkDisabled,
	params,
} = storeToRefs(useSdkStore())

const buttonRef = ref(null)

const { t } = useI18n()

const isDark = useDark()

const logoSrc = computed(() => (isDark.value ? logoDark : logoLight))

const {
	needsAutoTeleport,
	hasEnoughInCurrentChain,
	exec,
	autoteleport,
	retry,
	session,
	isAvailable,
	isCompleted,
	isReady,
	canAutoTeleport,
	hasNoFundsAtAll,
	insufficientFunds,
} = useAutoTeleport()

const { allowAutoTeleport, showAutoTeleport } = useAutoTeleportButton({
	needsAutoTeleport,
	isAvailable,
	isReady,
	canAutoTeleport,
	hasNoFundsAtAll,
	disabled: sdkDisabled,
})

const label = computed(() => {
	if (hasEnoughInCurrentChain.value || sdkDisabled.value || isCompleted.value) {
		return t('proceedWithAction', [sdkLabel.value])
	}

	if (insufficientFunds.value) {
		return t('autoteleport.notEnoughFunds')
	}

	if (allowAutoTeleport.value) {
		return t('autoteleport.sign', [getChainName(params.value.chain)])
	}
})

const isDisabled = computed(() => {
	if (isCompleted.value) {
		return false
	}

	if (sdkDisabled.value || insufficientFunds.value) {
		return true
	}

	if (hasEnoughInCurrentChain.value || allowAutoTeleport.value) {
		return false
	}

	return true
})

const submit = async () => {
	eventBus.emit('teleport:submit', {
		autoteleport: needsAutoTeleport.value,
		completed: isCompleted.value,
	})

	if (needsAutoTeleport.value && !isCompleted.value) {
		await exec()
	}
}

const onAddFunds = async () => {
	eventBus.emit('session:add-funds')
}
</script>
