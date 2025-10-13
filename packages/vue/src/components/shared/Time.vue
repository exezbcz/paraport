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

<template>
  <span class="pp-text-text pp-flex pp-gap-[2px] pp-capitalize">
    <span :class="deviderClass">~</span>
    <span>{{ displayDuration }}</span>
  </span>
</template>
