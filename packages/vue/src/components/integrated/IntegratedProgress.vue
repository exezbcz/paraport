<script setup lang="ts">
import type { TeleportEventPayload, TeleportSession } from '@paraport/core'
import type { Component, FunctionalComponent } from 'vue'

import type {
  TeleportStepDetails,
  TeleportStepStatus,
  TeleportStepType,
} from '@/types'
import { getChainName, TransactionTypes } from '@paraport/core'
import Button from '@ui/Button/Button.vue'
import { computed, h, ref } from 'vue'

import Container from '@/components/integrated/shared/Container.vue'
import AlertIcon from '@/components/integrated/shared/icon/AlertIcon.vue'
import LoaderIcon from '@/components/integrated/shared/icon/LoaderIcon.vue'
import PingDot from '@/components/integrated/shared/icon/PingDot.vue'
import LabelComponent from '@/components/integrated/shared/LabelComponent.vue'
import TeleportOverview from '@/components/integrated/shared/TeleportOverview.vue'
import GradientText from '@/components/shared/GradientText.vue'
import Time from '@/components/shared/Time.vue'
import useTeleportSteps from '@/composables/useTeleportSteps'
import { t } from '@/i18n/t'
import { TeleportStepStatuses } from '@/types'

type StateStrategy = Partial<
  Record<TeleportStepStatus | 'general', (params: { step: TeleportStepDetails, payload: TeleportEventPayload, t: typeof t }) => ComputedState>
>

interface ComputedIcon {
  icon: FunctionalComponent | Component
  class?: string
}

type ComputedLabel = {
  label?: string
  class?: string
  passive?: boolean
  is?: FunctionalComponent | Component
} & ({ label: string } | { is: FunctionalComponent | Component })

interface ComputedState {
  top: {
    icon: ComputedIcon
    title: ComputedLabel
  }
  bottom: {
    left: ComputedLabel
    right: ComputedLabel
  }
}

const props = defineProps<{
  session: TeleportSession
  autoteleport: TeleportEventPayload
}>()

const emit = defineEmits(['retry'])

const topSectionRef = ref()

const steps = useTeleportSteps(computed(() => props.autoteleport))

const activeStep = computed(() => {
  const step = steps.value.find(step => Boolean(step.isActive))
  return step as TeleportStepDetails
})

const iconStatusMap: Partial<Record<TeleportStepStatus, ComputedIcon>> = {
  [TeleportStepStatuses.Waiting]: { icon: PingDot },
  [TeleportStepStatuses.Loading]: { icon: LoaderIcon },
  [TeleportStepStatuses.Failed]: { icon: h(AlertIcon, { variant: 'error' }) },
  [TeleportStepStatuses.Cancelled]: {
    icon: h(AlertIcon, { variant: 'warning' }),
  },
}

const customStepStrategyMap: Partial<Record<TeleportStepType, StateStrategy>>
  = {
    [TransactionTypes.Teleport]: {
      [TeleportStepStatuses.Waiting]: ({ step, t }) => ({
        top: {
          icon: iconStatusMap[TeleportStepStatuses.Waiting] as ComputedIcon,
          title: {
            label: step.statusLabel,
            active: true,
          },
        },
        bottom: {
          left: {
            label: t('autoteleport.required'),
            class: 'pp-text-xs',
            passive: true,
          },
          right: {
            is: h(TeleportOverview, {
              session: props.session,
              buttonRef: topSectionRef,
            }),
          },
        },
      }),
      [TeleportStepStatuses.Loading]: ({ step, payload, t }) => ({
        top: {
          icon: iconStatusMap[TeleportStepStatuses.Loading] as ComputedIcon,
          title: {
            is: h(GradientText, {
              text: t('autoteleport.moving', [
                payload.details.asset,
                getChainName(payload.details.route.destination),
              ]),
            }),
          },
        },
        bottom: {
          left: {
            label: t('autoteleport.transactionSent'),
            class: 'pp-text-sm',
            passive: true,
          },
          right: {
            is: h(Time, {
              value: Number(step.duration),
              countdown: true,
            }),
            class: 'pp-text-xs',
          },
        },
      }),
    },
    'balance-check': {
      general: ({ step }) => ({
        top: {
          icon: iconStatusMap.loading!,
          title: {
            is: h(GradientText, {
              text: t('autoteleport.finalizing'),
            }),
          },
        },
        bottom: {
          left: {
            label: t('autoteleport.almostDone'),
            class: 'pp-text-sm',
            passive: true,
          },
          right: {
            is: h(Time, {
              value: Number(step.duration),
              countdown: true,
            }),
            class: 'pp-text-xs',
          },
        },
      }),
    },
  }

const generalStatusStrategyMap: StateStrategy = {
  [TeleportStepStatuses.Failed]: ({ step, t }) => {
    return {
      top: {
        icon: iconStatusMap.failed!,
        title: {
          label: step.statusLabel,
          class: 'pp-text-error-text',
        },
      },
      bottom: {
        left: {
          label: t('autoteleport.status.error'),
          class: 'pp-text-sm',
          passive: true,
        },
        right: {
          is: () =>
            h(
              Button,
              {
                variant: 'pill-danger',
                onClick: () => emit('retry'),
              },
              [h('span', t('retry'))],
            ),
        },
      },
    }
  },
  [TeleportStepStatuses.Cancelled]: () => {
    return {
      top: {
        icon: iconStatusMap.cancelled!,
        title: {
          label: 'Signing cancelled',
          class: 'pp-text-caution-text',
        },
      },
      bottom: {
        left: {
          label: 'Transaction couldn\'t complete',
          class: 'pp-text-sm',
          passive: true,
        },
        right: {
          is: () =>
            h(
              Button,
              {
                variant: 'pill-warning',
                onClick: () => emit('retry'),
              },
              [h('span', t('tryAgain'))],
            ),
        },
      },
    }
  },
}

const state = computed<ComputedState | undefined>(() => {
  const customStepStrategy
    = customStepStrategyMap[activeStep.value.type]?.general
      || customStepStrategyMap[activeStep.value.type]?.[activeStep.value.status]

  if (customStepStrategy) {
    return customStepStrategy({
      step: activeStep.value,
      payload: props.autoteleport,
      t,
    })
  }

  return generalStatusStrategyMap[activeStep.value.status]?.({
    step: activeStep.value,
    t,
    payload: props.autoteleport,
  })
})
</script>

<template>
  <Container v-if="state">
    <template #top>
      <div ref="topSectionRef" class="pp-h-full pp-w-full pp-flex pp-gap-3 pp-items-center">
        <div class="pp-h-[20px] pp-w-[20px] pp-relative" :class="state.top.icon.class">
          <component :is="state.top.icon.icon" />
        </div>

        <LabelComponent
          :is="state.top.title.is"
          :label="state.top.title.label"
          :label-class="state.top.title.class"
          :passive="state.top.title.passive"
          additional-class="capitalize"
        />
      </div>
    </template>

    <template #bottom>
      <LabelComponent
        :is="state.bottom.left.is"
        :label="state.bottom.left.label"
        :label-class="state.bottom.left.class"
        :passive="state.bottom.left.passive"
        additional-class="capitalize"
      />

      <LabelComponent
        :is="state.bottom.right.is"
        v-if="state.bottom.right"
        :label="state.bottom.right.label"
        :label-class="state.bottom.right.class"
        :passive="state.bottom.right.passive"
      />
    </template>
  </Container>
</template>
