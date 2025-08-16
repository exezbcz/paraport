<template>
    <Container  v-if="state">
        <template #top>
            <div class="h-full w-full flex gap-4 items-center">
                <div class="w-min h-min">
                    <div :class="state.top.icon.class">
                        <component :is="state.top.icon.icon" />
                    </div>
                </div>

                <p :class="[state.top.title.class, {'text-secondary': !state.top.title.active}]">
                    {{ state.top.title.label }}
                </p>
            </div>
        </template>

        <template #bottom>
            <p :class="[state.bottom.left.class, {'text-secondary': !state.bottom.left.active}, 'text-sm']">
                {{ state.bottom.left.label }}
            </p>
            <p v-if="state.bottom.right" :class="[state.bottom.right.class, {'text-secondary': !state.bottom.right.active}]">
                {{ state.bottom.right.label }}
            </p>
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
import { LoaderCircle, X } from 'lucide-vue-next'
import { type FunctionalComponent, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'

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
	icon: FunctionalComponent
	class?: string
}

type ComputedLabel = {
	label: string
	class?: string
	active?: boolean
}

type ComputedState = {
	top: {
		icon: ComputedIcon
		title: ComputedLabel
	}
	bottom: {
		left: ComputedLabel
		right?: ComputedLabel
	}
}

const PingDot = () => {
	return h('span', { class: 'relative flex size-3' }, [
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
			class: 'rounded-full bg-blue-100',
		},
		[
			h(
				'div',
				{
					class: 'animate-spin text-blue-500',
				},
				[h(LoaderCircle)],
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
	const step = steps.value.find((step) => Boolean(step.isActive))
	return step as TeleportStepDetails
})

const iconStatusMap: Partial<Record<TeleportStepStatus, ComputedIcon>> = {
	[TeleportStepStatus.Waiting]: { icon: PingDot },
	[TeleportStepStatus.Loading]: { icon: Loader },
	[TeleportStepStatus.Failed]: { icon: X, class: 'text-red-500' },
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
						label: 'View Details',
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
				},
			},
			bottom: {
				left: {
					label: t('retry'),
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
