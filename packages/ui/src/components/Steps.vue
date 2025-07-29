<template>
    <div class="flex flex-col gap-6">
        <StepItem v-for="item in items" :key="item.id" :step="item"

        @retry="$emit('retry')"
        />
    </div>
</template>

<script setup lang="ts">
import type { TeleportStepDetails } from '../types'
import StepItem from './StepItem.vue'

defineEmits(['retry'])
defineProps<{
	items: TeleportStepDetails[]
}>()
</script>
