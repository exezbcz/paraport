<template>
  <span class="text-text flex gap-[2px] capitalize">
    <span :class="deviderClass">~</span>
    <span>{{ displayDuration }}</span>
  </span>
</template>

<script setup lang="ts">
import { useCountDown } from '@/composables/useCountDown'

const props = defineProps<{
	value: number
	deviderClass?: string
	short?: boolean
	countdown?: boolean
}>()

const { displayDuration } = useCountDown({
	duration: props.value,
	immediate: props.countdown,
})
</script>
