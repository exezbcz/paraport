<template>
    <Container  v-if="state">
        <template #top>
            <div class="h-full w-full flex gap-4 items-center">
                <div class="h-[20px] w-[20px] relative" :class="state.top.icon.class">
                    <component :is="state.top.icon.icon" />
                </div>

                <LabelComponent
                    :label="state.top.title.label"
                    :label-class="state.top.title.class"
                    :active="state.top.title.active"
                    :is="state.top.title.is"
                />
            </div>
        </template>

        <template #bottom>
            <LabelComponent
                :label="state.bottom.left.label"
                :label-class="state.bottom.left.class"
                :active="state.bottom.left.active"
                :is="state.bottom.left.is"
                additional-class="text-sm"
            />

            <LabelComponent
                v-if="state.bottom.right"
                :label="state.bottom.right.label"
                :label-class="state.bottom.right.class"
                :active="state.bottom.right.active"
                :is="state.bottom.right.is"
            />
        </template>
    </Container>
</template>

<script setup lang="ts">
import useTeleportSteps from '@/composables/useTeleportSteps'
import {
	type TeleportStepDetails,
	TeleportStepStatus,
	TeleportStepType,
} from '@/types'
import {
	type TeleportEventPayload,
	type TeleportSession,
	TeleportStatus,
	TransactionType,
} from '@paraport/core'

import Container from '@/components/integrated/Container.vue'
import LabelComponent from '@/components/integrated/LabelComponent.vue'
import { CircleAlert, LoaderCircle } from 'lucide-vue-next'
import { type Component, type FunctionalComponent, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailsPill from './DetailsPill.vue'
import Pill from './Pill.vue'

type StateStrategy = Partial<
	Record<
		TeleportStepStatus | 'general',
		(params: {
			step: TeleportStepDetails
			payload: TeleportEventPayload
			t: typeof t
		}) => ComputedState
	>
>

type ComputedIcon = {
	icon: FunctionalComponent | Component
	class?: string
}

type ComputedLabel = {
	label?: string
	class?: string
	active?: boolean
	is?: FunctionalComponent | Component
} & ({ label: string } | { is: FunctionalComponent | Component })

type ComputedState = {
	top: {
		icon: ComputedIcon
		title: ComputedLabel
	}
	bottom: {
		left: ComputedLabel
		right: ComputedLabel
	}
}

const PingDot = () => {
	return h('span', { class: 'relative flex !size-3' }, [
		h('span', {
			class:
				'absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75',
		}),
		h('span', {
			class: 'relative inline-flex size-3 rounded-full bg-blue-500',
		}),
	])
}

const Loader = () => {
	return h(
		'div',
		{
			class: 'rounded-full bg-blue-100 ',
		},
		[
			h(
				'div',
				{
					class: 'animate-spin text-blue-500',
				},
				[h(LoaderCircle, { size: 20 })],
			),
		],
	)
}

const AlertIcon = (variant: 'error' | 'warning') => {
	const text = {
		error: 'text-error',
		warning: 'text-warning',
	}

	const bg = {
		error: 'bg-error-fill',
		warning: 'bg-warning-fill',
	}

	return h(
		'div',
		{
			class:
				'rounded-full flex items-center justify-center w-[inherit] h-[inherit] ' +
				bg[variant],
		},
		[
			h(
				'div',
				{
					class: text[variant],
				},
				[h(CircleAlert, { size: 12 })],
			),
		],
	)
}

const emit = defineEmits(['retry'])

const props = defineProps<{
	session: TeleportSession
	autoteleport: TeleportEventPayload
}>()

const { t } = useI18n()

const steps = useTeleportSteps(computed(() => props.autoteleport))

const activeStep = computed(() => {
  console.log(steps.value)
	const step = steps.value.find((step) => Boolean(step.isActive))
	return step as TeleportStepDetails
})

const iconStatusMap: Partial<Record<TeleportStepStatus, ComputedIcon>> = {
	[TeleportStepStatus.Waiting]: { icon: PingDot },
	[TeleportStepStatus.Loading]: { icon: Loader },
	[TeleportStepStatus.Failed]: { icon: () => AlertIcon('error') },
}

const customStepStrategyMap: Partial<Record<TeleportStepType, StateStrategy>> =
	{
		[TransactionType.Teleport]: {
			[TeleportStepStatus.Waiting]: ({ step, t }) => ({
				top: {
					icon: iconStatusMap[TeleportStepStatus.Waiting] as ComputedIcon,
					title: {
						label: step.statusLabel,
						active: true,
					},
				},
				bottom: {
					left: {
						label: t('autoteleport.required'),
					},
					right: {
						is: DetailsPill,
					},
				},
			}),
			[TeleportStepStatus.Loading]: ({ step, payload, t }) => ({
				top: {
					icon: iconStatusMap[TeleportStepStatus.Loading] as ComputedIcon,
					title: {
						label: t('autoteleport.moving', [
							payload.details.asset,
							payload.details.route.target,
						]),
					},
				},
				bottom: {
					left: {
						label: t('autoteleport.transactionSent'),
					},
					right: {
						label: t('autoteleport.estimatedSeconds', [
							(step.duration || 0) / 1000,
						]),
						class: 'text-xs',
					},
				},
			}),
		},
		['balance-check']: {
			general: ({ step }) => ({
				top: {
					icon: iconStatusMap.loading!,
					title: {
						label: t('autoteleport.finalizing'),
					},
				},
				bottom: {
					left: {
						label: t('autoteleport.almostDone'),
					},
					right: {
						label: t('autoteleport.estimatedSeconds', [
							(step.duration || 0) / 1000,
						]),
						class: 'text-xs',
					},
				},
			}),
		},
	}

const generalStatusStrategyMap: StateStrategy = {
	[TeleportStatus.Failed]: ({ step, t }) => {
		return {
			top: {
				icon: iconStatusMap.failed!,
				title: {
					label: step.statusLabel,
					class: '!text-error',
				},
			},
			bottom: {
				left: {
					label: t('autoteleport.status.error'),
				},
				right: {
					is: () =>
						h(
							Pill,
							{
								variant: 'error',
								as: 'button',
								onClick: () => emit('retry'),
							},
							[h('span', t('retry'))],
						),
				},
			},
		}
	},
}

const state = computed<ComputedState | undefined>(() => {
	const customStepStrategy =
		customStepStrategyMap[activeStep.value.type]?.general ||
		customStepStrategyMap[activeStep.value.type]?.[activeStep.value.status]

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
