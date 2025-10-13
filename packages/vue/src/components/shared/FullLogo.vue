<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { computed } from 'vue'

import logoLight from '@/assets/images/paraport_full_logo.svg'
import logoDark from '@/assets/images/paraport_full_logo_dark.svg'

const isDark = useDark()

const logoSrc = computed(() => (isDark.value ? logoDark : logoLight))
</script>

<template>
  <img :src="logoSrc">
</template>
