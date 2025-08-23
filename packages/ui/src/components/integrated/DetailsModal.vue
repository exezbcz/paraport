<template>
  <Dialog v-model:open="isOpen">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {{ t('detailsModal.title') }}
        </DialogTitle>
      </DialogHeader>

      <hr class="bg-surface-grey h-[1px]"/>

      <div class="flex flex-col">
        <div class="flex flex-col gap-[17px] text-xs">
            <div class="flex items-center justify-between">
                <span class="text-secondary"> {{t('detailsModal.route')}} </span>
                <div> </div>
            </div>

            <div class="flex items-center justify-between">
                <span class="text-secondary"> {{t('detailsModal.transferAmount')}} </span>
                <span class="text-text"> {{ String(session.params.amount) }} </span>
            </div>

            <div class="flex items-center justify-between">
                <span class="text-secondary"> {{t('detailsModal.fees')}} </span>
                <span class="text-text"> {{ String(session.quotes?.selected?.fees.total) }} </span>
            </div>

            <div class="flex items-center justify-between">
                <span class="text-secondary"> {{t('detailsModal.timeEstimate')}} </span>
                <span class="text-text"> {{ String(session.quotes?.selected?.fees.total) }} </span>
            </div>
        </div>

        <div class="rounded-lg bg-surface-grey py-4 px-[14px] flex flex-col gap-2 mt-[18px]">
            <p class="text-sm text-text capitalize">{{ t('detailsModal.whatIsAutoteleport.title') }}</p>
            <p class="text-xs text-secondary">{{ t('detailsModal.whatIsAutoteleport.description') }}</p>
        </div>


        <div class="flex items-center justify-between mt-[13px]">
            <DetailsPill label="Learn More" />

            <img src="@/assets/images/paraport_full_logo.svg">
        </div>


      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { type TeleportSession } from '@paraport/core'
import { useI18n } from 'vue-i18n'
import DetailsPill from './DetailsPill.vue'

defineProps<{
	session: TeleportSession
}>()

const isOpen = defineModel<boolean>()

const { t } = useI18n()
</script>
