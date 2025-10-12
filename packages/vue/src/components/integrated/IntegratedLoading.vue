<template>
   <Container top-classes="pp-bg-surface-grey">
        <template #top>
            <div class="pp-inline-flex pp-gap-3 pp-items-center pp-justify-center pp-w-full pp-text-secondary">
                <div class="pp-animate-spin pp-flex">
                    <LoaderCircleIcon :size="20" />
                </div>
                <span class="pp-text-[16px] pp-capitalize pp-font-medium">
                    {{ t('autoteleport.checking' )}}
                </span>
            </div>
        </template>
        <template #bottom>
            <p class="pp-text-secondary pp-capitalize pp-text-sm">
                {{ t('autoteleport.findingOptimalRoute')}}
            </p>

            <FullLogo class="pp-w-[82px]" />
        </template>
    </Container>
</template>

<script setup lang="ts">
import Container from '@/components/integrated/shared/Container.vue'
import FullLogo from '@/components/shared/FullLogo.vue'
import { LoaderCircleIcon } from 'lucide-vue-next'
import { t } from '@/i18n/t'
</script>
