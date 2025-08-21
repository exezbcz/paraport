<template>
    <Button
        variant="pill-info"
    >
        <Info :size="10" />

        <span>
            {{ t('details') }}
        </span>
    </Button>
</template>

<script setup lang="ts">
import Button from '@ui/Button/Button.vue'
import { Info } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
