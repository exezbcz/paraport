<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    :class="cn('pp-flex pp-flex-col pp-gap-y-1.5 pp-text-center sm:pp-text-left', props.class)"
  >
    <slot />
  </div>
</template>
