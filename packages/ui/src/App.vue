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
import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'

defineProps<{
	sdk: AutoTeleportSDK
	autoteleport: TeleportParams<string>
	label: string
	disabled?: boolean
	displayMode?: DisplayMode
}>()
</script>
