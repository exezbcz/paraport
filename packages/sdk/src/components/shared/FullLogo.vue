<template>
    <img :src="logoSrc" />
</template>

<script setup lang="ts">
import logoLight from '@/assets/images/paraport_full_logo.svg'
import logoDark from '@/assets/images/paraport_full_logo_dark.svg'

import { useDark } from '@vueuse/core'
import { computed } from 'vue'

const isDark = useDark()

const logoSrc = computed(() => (isDark.value ? logoDark : logoLight))
</script>
