<template>
  <div
    :class="[
      'rounded-full flex items-center justify-center w-[inherit] h-[inherit]',
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
		text: 'text-error-text',
		bg: 'bg-error-fill',
	},
	warning: {
		text: 'text-caution-text',
		bg: 'bg-caution-button',
	},
}

const props = defineProps<{
	variant: Variant
}>()

const textClass = computed(() => variantClassMap[props.variant].text)
const bgClass = computed(() => variantClassMap[props.variant].bg)
</script>
