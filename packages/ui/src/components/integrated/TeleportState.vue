<template>
    <Container  v-if="state">
        <template #top>
            <div class="h-full w-full flex gap-3 items-center">
                <div class="h-[20px] w-[20px] relative" :class="state.top.icon.class">
                    <component :is="state.top.icon.icon" />
                </div>

                <LabelComponent
                    :label="state.top.title.label"
                    :label-class="state.top.title.class"
                    :passive="state.top.title.passive"
                    :is="state.top.title.is"
                    additional-class="capitalize"
                />
            </div>
        </template>

        <template #bottom>
            <LabelComponent
                :label="state.bottom.left.label"
                :label-class="state.bottom.left.class"
                :passive="state.bottom.left.passive"
                :is="state.bottom.left.is"
                additional-class="capitalize"
            />

            <LabelComponent
                v-if="state.bottom.right"
                :label="state.bottom.right.label"
                :label-class="state.bottom.right.class"
                :passive="state.bottom.right.passive"
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
import Button from '@ui/Button/Button.vue'
import { type Component, type FunctionalComponent, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'
import AlertIcon from './AlertIcon.vue'
import LoaderIcon from './LoaderIcon.vue'
import Pill from './Pill.vue'
import PingDot from './PingDot.vue'
import TeleportOverview from './TeleportOverview.vue'

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
	passive?: boolean
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

const emit = defineEmits(['retry'])

const props = defineProps<{
	session: TeleportSession
	autoteleport: TeleportEventPayload
}>()

const { t } = useI18n()

const steps = useTeleportSteps(computed(() => props.autoteleport))

const activeStep = computed(() => {
	const step = steps.value.find((step) => Boolean(step.isActive))
	return step as TeleportStepDetails
})

const iconStatusMap: Partial<Record<TeleportStepStatus, ComputedIcon>> = {
	[TeleportStepStatus.Waiting]: { icon: PingDot },
	[TeleportStepStatus.Loading]: { icon: LoaderIcon },
	[TeleportStepStatus.Failed]: { icon: h(AlertIcon, { variant: 'error' }) },
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
						class: 'text-xs',
						passive: true,
					},
					right: {
						is: h(TeleportOverview, {
							session: props.session,
						}),
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
						passive: true,
					},
				},
				bottom: {
					left: {
						label: t('autoteleport.transactionSent'),
						class: 'text-sm',
						passive: true,
					},
					right: {
						label: t('autoteleport.estimatedSeconds', [
							(step.duration || 0) / 1000,
						]),
						class: 'text-xs',
						passive: true,
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
						passive: true,
					},
				},
				bottom: {
					left: {
						label: t('autoteleport.almostDone'),
						class: 'text-sm',
						passive: true,
					},
					right: {
						label: t('autoteleport.estimatedSeconds', [
							(step.duration || 0) / 1000,
						]),
						class: 'text-xs',
						passive: true,
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
					class: '!text-error-text',
				},
			},
			bottom: {
				left: {
					label: t('autoteleport.status.error'),
					class: 'text-sm',
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
