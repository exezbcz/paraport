<template>
    <div class="flex flex-col gap-6">
        <StepItem v-for="item in items" :key="item.id" :step="item" />
    </div>
</template>

<script setup lang="ts">
import type { TeleportStepDetails } from '../types'
import StepItem from './StepItem.vue'

defineProps<{
	items: TeleportStepDetails[]
}>()
</script>
