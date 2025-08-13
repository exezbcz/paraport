<template>
  <div class="border border-gray-400 rounded-lg">
    <div class="flex gap-4 border-b border-gray-400 py-2 px-4 rounded-b-lg max-h-10 items-center">
        <div class="w-min h-min">
            <div :class="state.top.icon.class">
                <component :is="state.top.icon.icon" />
            </div>
        </div>

        <p :class="state.top.title.class">
            {{ state.top.title.label }}
        </p>
    </div>
    <div class="px-4 py-2 flex justify-between">
      <p :class="state.bottom.left.class">
        {{ state.bottom.left.label }}
      </p>
      <p :class="state.bottom.right.class">
        {{ state.bottom.right.label }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import useTeleportSteps from '@/composables/useTeleportSteps'
import { type TeleportStepDetails, TeleportStepStatus } from '@/types'
import { type TeleportEventPayload, TransactionType } from '@paraport/core'
import { LoaderCircle, X } from 'lucide-vue-next'
import { type FunctionalComponent, computed, h } from 'vue'
import { useI18n } from 'vue-i18n'

type ComputedIcon = {
	icon: FunctionalComponent
	class?: string
}

type ComputedLabel = {
	label: string
	class?: string
}

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

const props = defineProps<{
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

const state = computed<ComputedState>(() => {
	const activeTransactionBottom = {
		left: {
			label:
				activeStep.value.status === TeleportStepStatus.Waiting
					? t('autoteleport.required')
					: t('autoteleport.transactionSent'),
			class: 'text-gray-500',
		},
		right: {
			label:
				activeStep.value.status === TeleportStepStatus.Waiting
					? 'View Details'
					: t('autoteleport.estimatedSeconds', [
							(activeStep.value.duration || 0) / 1000,
						]),
			class: 'text-gray-500',
		},
	}

	if (activeStep.value?.type === TransactionType.Teleport) {
		return {
			top: {
				icon: (iconStatusMap[activeStep.value.status] ||
					iconStatusMap['waiting']) as ComputedIcon,
				title: {
					label:
						activeStep.value.status === TeleportStepStatus.Loading
							? t('autoteleport.moving', [
									props.autoteleport.details.asset,
									props.autoteleport.details.route.target,
								])
							: activeStep.value.statusLabel,
					class:
						activeStep.value.status === TeleportStepStatus.Waiting
							? ''
							: 'text-gray-500',
				},
			},
			bottom: activeTransactionBottom,
		}
	}
	return {
		top: {
			icon: iconStatusMap['loading'],
			title: {
				label: t('autoteleport.finalizing'),
				class: 'text-gray-500',
			},
		},
		bottom: activeTransactionBottom,
	}
})
</script>
