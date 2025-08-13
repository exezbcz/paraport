<template>
    <TeleportButton
        v-if="displayMode === DisplayMode.Integrated"
        :sdk="sdk"
        :autoteleport="autoteleport"
        :label="label"
        :disabled="disabled"
    />
</template>

<script setup lang="ts">
import TeleportButton from '@/components/TeleportButton.vue'
import { type AppProps, DisplayMode } from '@/types'

defineProps<AppProps>()
</script>
