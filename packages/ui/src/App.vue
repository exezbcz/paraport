<template>
    <TeleportButton
        :sdk="sdk"
        :autoteleport="autoteleport"
        :label="label"
        :disabled="disabled"
        :display-mode="displayMode"
    />
</template>

<script setup lang="ts">
import TeleportButton from '@/components/TeleportButton.vue'
import type { DisplayMode } from '@/types'
import type { ParaPortSDK, TeleportParams } from '@paraport/core'

defineProps<{
	sdk: ParaPortSDK
	autoteleport: TeleportParams<string>
	label: string
	disabled?: boolean
	displayMode?: DisplayMode
}>()
</script>
