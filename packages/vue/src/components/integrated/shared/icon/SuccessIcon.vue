<template>
  <div
    :class="[
      'rounded-full flex items-center justify-center bg-success-fill w-[20px] h-[20px]',
    ]"
  >
    <div class="text-success-text">
      <CircleCheck :size="12" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleCheck } from 'lucide-vue-next'
</script>
