<template>
  <component
      :is="is || 'p'"
      :class="[labelClass, {
        'text-text': !passive,
        'text-secondary': passive,
      }, additionalClass]"
  >
    {{ label }}
  </component>
</template>

<script setup lang="ts">
import { Component, DefineComponent, FunctionalComponent } from 'vue'

defineProps<{
	label?: string
	labelClass?: string
	passive?: boolean
	is?: Component | FunctionalComponent | DefineComponent<any, any, any>
	additionalClass?: string
}>()
</script>
