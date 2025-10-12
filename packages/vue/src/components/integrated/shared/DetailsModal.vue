<template>
  <Dialog v-model:open="isOpen">
    <DialogContent :position>
      <DialogHeader>
        <DialogTitle>
          {{ t('detailsModal.title') }}
        </DialogTitle>
      </DialogHeader>

      <hr class="pp-bg-surface-grey pp-h-[1px] pp-w-full"/>

      <div class="pp-flex pp-flex-col" v-if="selectedQuote">
        <div class="pp-flex pp-flex-col pp-gap-[17px] pp-text-xs">
            <div class="pp-flex pp-items-center pp-justify-between">
                <span class="pp-text-secondary"> {{t('detailsModal.route')}} </span>
                <div class="pp-flex pp-items-center pp-gap-3 pp-text-text">
                    <div> {{ sourceChain }} </div>
                    <ArrowRight :size="7" />
                    <div> {{ targetChain }} </div>
                </div>
            </div>

            <div class="pp-flex pp-items-center pp-justify-between">
                <span class="pp-text-secondary"> {{t('detailsModal.transferAmount')}} </span>
                <Amount class="pp-text-text" :amount="selectedQuote.amount" :chain="selectedQuote.route.origin" :asset="selectedQuote.asset" />
            </div>

            <div class="pp-flex pp-items-center pp-justify-between">
                <span class="pp-text-secondary"> {{t('detailsModal.fees')}} </span>
                <Amount class="pp-text-text" :amount="selectedQuote.fees.total" :chain="selectedQuote.route.origin" :asset="selectedQuote.asset" />
            </div>

            <div class="pp-flex pp-items-center pp-justify-between">
                <span class="pp-text-secondary"> {{t('detailsModal.timeEstimate')}} </span>
                <Time class="pp-text-text" :value="selectedQuote.execution.timeMs" />
            </div>
        </div>

        <div class="pp-rounded-lg pp-bg-surface-grey pp-py-4 pp-px-[14px] pp-flex pp-flex-col pp-gap-2 pp-mt-[18px]">
            <p class="pp-text-sm pp-text-text pp-capitalize">{{ t('detailsModal.whatIsAutoteleport.title') }}</p>
            <p class="pp-text-xs pp-text-secondary">
            {{
              t('detailsModal.whatIsAutoteleport.description', {
                  asset: selectedQuote?.asset,
                  source: sourceChain,
                  target: targetChain,
                })
              }}
            </p>
        </div>


        <div class="pp-flex pp-items-center pp-justify-between pp-mt-[13px]">
            <DetailsPill :label="t('learnMore')" />

            <FullLogo class="pp-w-[82px]" />
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
import { t } from '@/i18n/t'
import DetailsPill from './DetailsPill.vue'

const props = defineProps<{
	session: TeleportSession
	position: { left: string; top: string }
}>()

const isOpen = defineModel<boolean>()


const selectedQuote = computed(() => props.session.quotes.selected)

const sourceChain = computed(() =>
	selectedQuote.value ? getChainName(selectedQuote.value.route.origin) : '',
)
const targetChain = computed(() =>
	selectedQuote.value ? getChainName(selectedQuote.value.route.destination) : '',
)
</script>
