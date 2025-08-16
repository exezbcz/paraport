<template>
    <div class="flex gap-2 bg-surface-grey py-1 px-2 rounded-full items-center justify-center text-secondary">
        <Info :size="12" />

        <span class="text-xs">
            {{ t('details') }}
        </span>
    </div>
</template>

<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
