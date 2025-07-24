<template>
  <o-button
    class="sdk-button"
    v-bind="$props"
    :expanded="expanded"
    :label="label"
    :disabled="disabled"
    :loading="loading"
  >
    <template
      v-if="$slots.default"
      #default
    >
      <slot />
    </template>
  </o-button>
</template>

<script lang="ts" setup>
import { OButton } from '@oruga-ui/oruga-next'

defineProps<{
	disabled?: boolean
	expanded?: boolean
	label?: string
	loading?: boolean
}>()
</script>

<style src="./Button.scss" lang="scss" scoped></style>
