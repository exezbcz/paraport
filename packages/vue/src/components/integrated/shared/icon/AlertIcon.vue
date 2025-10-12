<template>
  <div
    :class="[
      'pp-rounded-full pp-flex pp-items-center pp-justify-center pp-w-[inherit] pp-h-[inherit]',
      bgClass
    ]"
  >
    <div :class="textClass">
      <CircleAlert :size="12" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { CircleAlert } from 'lucide-vue-next'
import { computed } from 'vue'

type Variant = 'error' | 'warning'

const variantClassMap: Record<Variant, { text: string; bg: string }> = {
	error: {
		text: 'pp-text-error-text',
		bg: 'pp-bg-error-fill',
	},
	warning: {
		text: 'pp-text-caution-text',
		bg: 'pp-bg-caution-button',
	},
}

const props = defineProps<{
	variant: Variant
}>()

const textClass = computed(() => variantClassMap[props.variant].text)
const bgClass = computed(() => variantClassMap[props.variant].bg)
</script>
