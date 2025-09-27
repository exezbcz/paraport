<template>
    <Container  v-if="state">
        <template #top>
            <div class="h-full w-full flex gap-3 items-center" ref="topSectionRef">
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
import { type Component, type FunctionalComponent, computed, h, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import useTeleportSteps from '@/composables/useTeleportSteps'
import {
	type TeleportStepDetails,
	type TeleportStepStatus,
	TeleportStepStatuses,
	TeleportStepType,
} from '@/types'
import {
	type TeleportEventPayload,
	type TeleportSession,
	TransactionTypes,
	getChainName,
} from '@paraport/core'

import Container from '@/components/integrated/shared/Container.vue'
import LabelComponent from '@/components/integrated/shared/LabelComponent.vue'
import TeleportOverview from '@/components/integrated/shared/TeleportOverview.vue'
import AlertIcon from '@/components/integrated/shared/icon/AlertIcon.vue'
import LoaderIcon from '@/components/integrated/shared/icon/LoaderIcon.vue'
import PingDot from '@/components/integrated/shared/icon/PingDot.vue'
import GradientText from '@/components/shared/GradientText.vue'
import Time from '@/components/shared/Time.vue'
import Button from '@ui/Button/Button.vue'

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

const topSectionRef = ref()

const { t } = useI18n()

const steps = useTeleportSteps(computed(() => props.autoteleport))

const activeStep = computed(() => {
	const step = steps.value.find((step) => Boolean(step.isActive))
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

const customStepStrategyMap: Partial<Record<TeleportStepType, StateStrategy>> =
	{
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
						class: 'text-xs',
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
								getChainName(payload.details.route.target),
							]),
						}),
					},
				},
				bottom: {
					left: {
						label: t('autoteleport.transactionSent'),
						class: 'text-sm',
						passive: true,
					},
					right: {
						is: h(Time, {
							value: Number(step.duration),
							countdown: true,
						}),
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
						is: h(GradientText, {
							text: t('autoteleport.finalizing'),
						}),
					},
				},
				bottom: {
					left: {
						label: t('autoteleport.almostDone'),
						class: 'text-sm',
						passive: true,
					},
					right: {
						is: h(Time, {
							value: Number(step.duration),
							countdown: true,
						}),
						class: 'text-xs',
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
					class: 'text-error-text',
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
	[TeleportStepStatuses.Cancelled]: () => {
		return {
			top: {
				icon: iconStatusMap.cancelled!,
				title: {
					label: 'Signing cancelled',
					class: 'text-caution-text',
				},
			},
			bottom: {
				left: {
					label: "Transaction couldn't complete",
					class: 'text-sm',
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
