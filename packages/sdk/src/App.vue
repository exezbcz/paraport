<template>
    <div class="paraport">
        <IntegratedParaport v-if="displayMode === DisplayModes.Integrated" />
    </div>
</template>

<script setup lang="ts">
import IntegratedParaport from '@/components/integrated/Integrated.vue'
import useSystemDarkMode from '@/composables/useSystemDarkMode'
import { useSdkStore } from '@/stores'
import { DisplayModes } from '@/types'
import { storeToRefs } from 'pinia'

const { displayMode } = storeToRefs(useSdkStore())

useSystemDarkMode()
</script>
