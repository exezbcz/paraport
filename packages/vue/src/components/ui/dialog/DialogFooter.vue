<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

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
