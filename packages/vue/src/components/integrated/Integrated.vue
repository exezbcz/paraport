<script setup lang="ts">
import {
  blockExplorerOf,
  getChainName,
  TeleportSessionStatuses,
} from '@paraport/core'
import Button from '@ui/Button/Button.vue'
import { useDark } from '@vueuse/core'
import { ArrowUpRight } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import logoLight from '@/assets/images/paraport_logo.svg'
import logoDark from '@/assets/images/paraport_logo_dark.svg'
import Container from '@/components/integrated/shared/Container.vue'
import SuccessIcon from '@/components/integrated/shared/icon/SuccessIcon.vue'
import TeleportOverview from '@/components/integrated/shared/TeleportOverview.vue'
import useAutoTeleport from '@/composables/useAutoTeleport'
import useAutoTeleportButton from '@/composables/useAutoTeleportButton'
import { useSdk } from '@/composables/useSdk'
import { t } from '@/i18n/t'
import eventBus from '@/utils/event-bus'
import IntegratedLoading from './IntegratedLoading.vue'
import IntegratedProgress from './IntegratedProgress.vue'

const {
  label: sdkLabel,
  disabled: sdkDisabled,
  params,
  ui,
} = useSdk()

const buttonRef = ref(null)

const isDark = useDark()

const logoSrc = computed(() => (isDark.value ? logoDark : logoLight))
const canAddFunds = computed(() => Boolean(ui?.value))

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
    return sdkLabel.value || t('proceed')
  }

  if (insufficientFunds.value) {
    return t('autoteleport.notEnoughFunds')
  }

  if (allowAutoTeleport.value) {
    return t('autoteleport.sign', [getChainName(params.value.chain)])
  }

  return ''
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

async function submit() {
  eventBus.emit('teleport:submit', {
    autoteleport: needsAutoTeleport.value,
    completed: isCompleted.value,
  })

  if (needsAutoTeleport.value && !isCompleted.value) {
    await exec()
  }
}

async function onAddFunds() {
  eventBus.emit('session:add-funds')
}

function viewTx() {
  const chain = autoteleport.value?.details.route.origin
  const txHash = autoteleport.value?.transactions[0].txHash

  if (!txHash || !chain)
    return

  window.open(`${blockExplorerOf(chain)}/extrinsic/${txHash}`, '_blank')
}
</script>

<template>
  <IntegratedProgress
    v-if="session?.status === TeleportSessionStatuses.Processing && autoteleport"
    :session="session"
    :autoteleport="autoteleport"
    @retry="retry"
  />

  <IntegratedLoading v-else-if="!isReady && !isCompleted" />

  <Container v-else>
    <template #action>
      <Button
        ref="buttonRef"
        :disabled="isDisabled"
        class="pp-w-full"
        @click="submit"
      >
        <div class="pp-inline-flex pp-gap-3 pp-items-center pp-justify-center">
          <img v-if="showAutoTeleport" :src="logoSrc" class="pp-w-[20px]" alt="Paraport Logo">
          <span class="pp-text-[16px] pp-capitalize pp-font-medium">{{ label }}</span>
        </div>
      </Button>
    </template>
    <template v-if="showAutoTeleport || isCompleted || insufficientFunds" #bottom>
      <template v-if="isCompleted">
        <div class="pp-flex pp-items-center pp-gap-2">
          <SuccessIcon />

          <p class="pp-text-success-text pp-capitalize pp-text-xs">
            {{ t('autoteleport.successfullyMoved', [session?.quotes.selected?.asset]) }}
          </p>
        </div>

        <Button
          variant="pill-success"
          class="!pp-gap-0"
          @click="viewTx"
        >
          <span>
            {{ t('viewTx') }}
          </span>

          <ArrowUpRight :size="10" />
        </Button>
      </template>
      <template v-else-if="insufficientFunds">
        <p class="pp-text-secondary pp-capitalize pp-text-xs">
          {{ t('autoteleport.insufficientAssetBalance', [params.asset]) }}
        </p>

        <Button v-if="canAddFunds" variant="pill-blue" @click="onAddFunds">
          <span>{{ t('addFunds') }}</span>
        </Button>
      </template>
      <template v-else-if="showAutoTeleport">
        <p class="pp-text-secondary pp-capitalize pp-text-xs">
          {{ t('autoteleport.required') }}
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
