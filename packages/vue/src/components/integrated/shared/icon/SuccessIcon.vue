<template>
  <div
    :class="[
      'pp-rounded-full pp-flex pp-items-center pp-justify-center pp-bg-success-fill pp-w-[20px] pp-h-[20px]',
    ]"
  >
    <div class="pp-text-success-text">
      <CircleCheck :size="12" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleCheck } from 'lucide-vue-next'
</script>
