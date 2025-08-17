<template>
  <component
      :is="is || 'p'"
      :class="[labelClass, {'text-secondary': !active}, additionalClass]"
  >
    {{ label }}
  </component>
</template>

<script setup lang="ts">
import { Component, DefineComponent, FunctionalComponent } from 'vue'

defineProps<{
	label?: string
	labelClass?: string
	active?: boolean
	is?: Component | FunctionalComponent | DefineComponent<any, any, any>
	additionalClass?: string
}>()
</script>
