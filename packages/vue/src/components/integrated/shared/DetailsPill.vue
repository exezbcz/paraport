<script setup lang="ts">
import Button from '@ui/Button/Button.vue'
import { Info } from 'lucide-vue-next'
import { t } from '@/i18n/t'

defineProps<{
  active?: boolean
  label?: string
}>()

defineEmits(['click'])
</script>

<template>
  <Button
    variant="pill-info"
    :active="active"
    @click="$emit('click')"
  >
    <Info :size="10" />

    <span>
      {{ label || t('details') }}
    </span>
  </Button>
</template>
