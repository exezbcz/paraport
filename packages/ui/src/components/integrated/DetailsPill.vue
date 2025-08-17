<template>
    <Pill
        variant="info"
        v-slot="{ size }"
    >
        <Info :size="size" />

        <span>
            {{ t('details') }}
        </span>
    </Pill>
</template>

<script setup lang="ts">
import { Info } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import Pill from './Pill.vue'

const { t } = useI18n()
</script>
