<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next'
</script>

<template>
  <div class="pp-rounded-full pp-bg-accent-background">
    <div class="pp-animate-spin pp-text-accent-blue">
      <LoaderCircle :size="20" />
    </div>
  </div>
</template>
