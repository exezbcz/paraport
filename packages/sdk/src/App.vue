<template>
    <IntegratedParaport v-if="displayMode === DisplayMode.Integrated" />
</template>

<script setup lang="ts">
import IntegratedParaport from '@/components/integrated/Integrated.vue'
import useSystemDarkMode from '@/composables/useSystemDarkMode'
import { useSdkStore } from '@/stores'
import { DisplayMode } from '@/types'
import { storeToRefs } from 'pinia'

const { displayMode } = storeToRefs(useSdkStore())

useSystemDarkMode()
</script>
