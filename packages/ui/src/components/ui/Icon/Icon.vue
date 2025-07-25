<template>
    <o-icon
      :icon="icon"
       :pack="pack"
    />
</template>

<script setup lang="ts">
import { OIcon } from '@oruga-ui/oruga-next'

const props = withDefaults(
	defineProps<{
		icon: string
		pack?: string
	}>(),
	{
		pack: 'mdi',
	},
)
</script>
