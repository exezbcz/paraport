<template>
    <div class="flex items-center gap-6">
        <Icon
          :icon="icon.icon"
          :class="icon.class"
        />

        <div class="flex flex-col gap-1">
            <p> {{ transaction.id }} </p>
            <p> {{ transaction.status }} </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
	type TeleportEventPayload,
	TransactionStatus,
} from '@autoteleport/core'
import { computed } from 'vue'
import Icon from './ui/Icon/Icon.vue'

const props = defineProps<{
	transaction: TeleportEventPayload['transactions'][0]
}>()

const icon = computed<{
	icon: string
	class: string
}>(() => {
	if (props.transaction.status === TransactionStatus.Finalized) {
		return {
			icon: 'check',
			class: 'text-green-500',
		}
	} else if (props.transaction.error) {
		return {
			icon: 'window-close',
			class: 'text-red-500',
		}
	} else {
		return {
			icon: 'circle',
			class: 'text-gray-500',
		}
	}
})
</script>
