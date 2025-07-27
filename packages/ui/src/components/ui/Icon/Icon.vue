<template>
    <o-icon
      :icon="icon"
       :pack="pack"
       :spin="spin"
       :size="size"
    />
</template>

<script setup lang="ts">
import { OIcon } from '@oruga-ui/oruga-next'

withDefaults(
	defineProps<{
		icon: string
		pack?: string
		spin?: boolean
		size?: string
	}>(),
	{
		pack: 'mdi',
		spin: false,
	},
)
</script>
