<template>
  <Dialog v-model:open="isOpen">
    <DialogContent :position>
      <DialogHeader>
        <DialogTitle>
          {{ t('detailsModal.title') }}
        </DialogTitle>
      </DialogHeader>

      <hr class="bg-surface-grey h-[1px]"/>

      <div class="flex flex-col" v-if="selectedQuote">
        <div class="flex flex-col gap-[17px] text-xs">
            <div class="flex items-center justify-between">
                <span class="text-secondary"> {{t('detailsModal.route')}} </span>
                <div class="flex items-center gap-3 text-text">
                    <div> {{ sourceChain }} </div>
                    <ArrowRight :size="7" />
                    <div> {{ targetChain }} </div>
                </div>
            </div>

            <div class="flex items-center justify-between">
                <span class="text-secondary"> {{t('detailsModal.transferAmount')}} </span>
                <Amount class="text-text" :amount="selectedQuote.amount" :chain="selectedQuote.route.source" />
            </div>

            <div class="flex items-center justify-between">
                <span class="text-secondary"> {{t('detailsModal.fees')}} </span>
                <Amount class="text-text" :amount="selectedQuote.fees.total" :chain="selectedQuote.route.source" />
            </div>

            <div class="flex items-center justify-between">
                <span class="text-secondary"> {{t('detailsModal.timeEstimate')}} </span>
                <Time class="text-text" :value="selectedQuote.execution.timeMs" />
            </div>
        </div>

        <div class="rounded-lg bg-surface-grey py-4 px-[14px] flex flex-col gap-2 mt-[18px]">
            <p class="text-sm text-text capitalize">{{ t('detailsModal.whatIsAutoteleport.title') }}</p>
            <p class="text-xs text-secondary">
            {{
              t('detailsModal.whatIsAutoteleport.description', {
                  asset: selectedQuote?.asset,
                  source: sourceChain,
                  target: targetChain,
                })
              }}
            </p>
        </div>


        <div class="flex items-center justify-between mt-[13px]">
            <DetailsPill :label="t('learnMore')" />

            <FullLogo class="w-[82px]" />
        </div>

      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import Amount from '@/components/shared/Amount.vue'
import FullLogo from '@/components/shared/FullLogo.vue'
import Time from '@/components/shared/Time.vue'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog'
import { type TeleportSession, getChainName } from '@paraport/core'
import { ArrowRight } from 'lucide-vue-next'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailsPill from './DetailsPill.vue'

const props = defineProps<{
	session: TeleportSession
	position: { left: string; top: string }
}>()

const isOpen = defineModel<boolean>()

const { t } = useI18n()

const selectedQuote = computed(() => props.session.quotes.selected)

const sourceChain = computed(() =>
	selectedQuote.value ? getChainName(selectedQuote.value.route.source) : '',
)
const targetChain = computed(() =>
	selectedQuote.value ? getChainName(selectedQuote.value.route.target) : '',
)
</script>
