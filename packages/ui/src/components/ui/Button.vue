<template>
  <o-button
    class="is-auto"
    v-bind="$props"
    :expanded="expanded"
    :label="label"
    :disabled="disabled"
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
}>()
</script>

<style src="./Button.scss" lang="scss" scoped></style>
