<script setup lang="ts">
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'

const props = defineProps<{ class?: HTMLAttributes['class'] }>()
</script>

<template>
  <div
    :class="
      cn(
        'pp-flex pp-flex-col-reverse sm:pp-flex-row sm:pp-justify-end sm:pp-gap-x-2',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
