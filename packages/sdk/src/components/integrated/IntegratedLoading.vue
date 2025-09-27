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
import Container from '@/components/integrated/shared/Container.vue'
import FullLogo from '@/components/shared/FullLogo.vue'
import { LoaderCircleIcon } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
