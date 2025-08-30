<template>
  <component
      :is="is || 'p'"
      :class="[labelClass, {
        'text-text': active,
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
	active?: boolean
	is?: Component | FunctionalComponent | DefineComponent<any, any, any>
	additionalClass?: string
}>()
</script>
