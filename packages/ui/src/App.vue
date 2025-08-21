<template>
    <IntegratedAutoTeleport
        v-if="displayMode === DisplayMode.Integrated"
        :sdk="sdk"
        :autoteleport="autoteleport"
        :label="label"
        :disabled="disabled"
    />
</template>

<script setup lang="ts">
import IntegratedAutoTeleport from '@/components/integrated/IntegratedAutoTeleport.vue'
import useSystemDarkMode from '@/composables/useSystemDarkMode'
import { type AppProps, DisplayMode } from '@/types'

defineProps<AppProps>()

useSystemDarkMode()
</script>
