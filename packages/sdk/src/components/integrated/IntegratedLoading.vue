<template>
   <Container top-classes="bg-surface-grey">
        <template #top>
            <div class="inline-flex gap-3 items-center justify-center w-full text-secondary">
                <div class="animate-spin">
                    <LoaderCircleIcon :size="20" />
                </div>
                <span class="text-[16px] capitalize font-medium">
                    {{ t('autoteleport.checking' )}}
                </span>
            </div>
        </template>
        <template #bottom>
            <p class="text-secondary capitalize text-sm">
                {{ t('autoteleport.findingOptimalRoute')}}
            </p>

            <FullLogo class="w-[82px]" />
        </template>
    </Container>
</template>

<script setup lang="ts">
import FullLogo from '@/components/common/FullLogo.vue'
import { useI18n } from 'vue-i18n'
import Container from './Container.vue'
import { LoaderCircleIcon } from 'lucide-vue-next'

const { t } = useI18n()
</script>
