<template>
    <div class="flex items-center gap-6">
        <Icon
            :icon="icon.icon"
            :class="icon.class"
            :spin="icon.spin"
        />

        <div class="flex flex-col gap-1">
            <p class="font-bold"> {{ step.title }} </p>

            <div class="flex items-center gap-2">
                <p class="text-gray-500 capitalize"> {{ step.statusLabel }} </p>

                <div
                    v-if="step.status === TeleportStepStatus.Completed && step.txHash"
                    class="text-blue-500 hover:underline text-xs flex gap-1 items-center"
                >
                    <a href="#" >View Tx</a>
                    <Icon icon="arrow-top-right" size="small" />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { type TeleportStepDetails, TeleportStepStatus } from '../types'
import Icon from './ui/Icon/Icon.vue'

const props = defineProps<{
	step: TeleportStepDetails
}>()

const statusMap: Partial<
	Record<
		TeleportStepStatus,
		{ icon: string; class: string; spin?: boolean; size?: string }
	>
> = {
	[TeleportStepStatus.Completed]: {
		icon: 'check',
		class: 'text-green-500',
	},
	[TeleportStepStatus.Loading]: {
		icon: 'dots-circle',
		class: 'text-gray-600',
		spin: true,
	},
	[TeleportStepStatus.Failed]: {
		icon: 'window-close',
		class: 'text-red-500',
	},
}

const icon = computed<{
	icon: string
	class: string
	spin?: boolean
	size?: string
}>(() => {
	return (
		statusMap[props.step.status] || {
			icon: 'circle',
			class: 'text-gray-200',
		}
	)
})
</script>
