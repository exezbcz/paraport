<script setup lang="ts">
import type { TeleportSession } from '@paraport/core'
import type { Ref } from 'vue'
import DetailsModal from '@components/integrated/shared/DetailsModal.vue'
import Time from '@components/shared/Time.vue'
import { useElementBounding, useElementSize, useWindowSize } from '@vueuse/core'
import { computed, ref } from 'vue'
import { t } from '@/i18n/t'
import DetailsPill from './DetailsPill.vue'

const props = defineProps<{
  session: TeleportSession
  buttonRef: Ref<HTMLButtonElement | null>
}>()
const MODAL_HEIGHT = 397
const MODAL_WIDTH = 320

const VIEWPORT_MARGIN = 10
const BUTTON_SPACING = 10
const MIN_TOP_SPACING = 10

const NARROW_WIDTH = 380

const isModalActive = ref(false)

const { width } = useElementSize(props.buttonRef)

const isContainerNarrow = computed(() => width.value < NARROW_WIDTH)

const buttonBounds = useElementBounding(props.buttonRef)

const { width: windowWidth } = useWindowSize()

const position = computed(() => {
  // Center horizontally relative to button
  const left
    = buttonBounds.left.value + buttonBounds.width.value / 2 - MODAL_WIDTH / 2

  const spaceAbove = buttonBounds.top.value
  const spaceBelow
    = windowWidth.value - (buttonBounds.top.value + buttonBounds.height.value)

  const shouldPositionBelow
    = spaceBelow >= MODAL_HEIGHT + BUTTON_SPACING
      && spaceAbove < MODAL_HEIGHT + BUTTON_SPACING

  const top = shouldPositionBelow
    ? buttonBounds.top.value + buttonBounds.height.value + BUTTON_SPACING
    : buttonBounds.top.value - MODAL_HEIGHT - BUTTON_SPACING

  // Ensure modal stays within viewport horizontally
  const safeLeft = Math.max(
    VIEWPORT_MARGIN,
    Math.min(left, windowWidth.value - MODAL_WIDTH - VIEWPORT_MARGIN),
  )

  return {
    left: `${safeLeft}px`,
    top: `${Math.max(MIN_TOP_SPACING, top)}px`,
  }
})
</script>

<template>
  <div class="pp-flex pp-items-center" :class="isContainerNarrow ? 'pp-gap-3' : 'pp-gap-5'">
    <div class="pp-flex pp-gap-1 pp-text-xs pp-capitalize">
      <Time
        :value="Number(session.quotes.selected?.execution.timeMs)"
        devider-class="!pp-text-secondary"
        short
      />
      <template v-if="!isContainerNarrow">
        <div class="pp-w-1 pp-h-1 pp-rounded-full pp-bg-surface-grey pp-self-center" />
        <span> {{ session.quotes.selected?.execution.requiredSignatureCount }} {{ t('signature') }} </span>
      </template>
    </div>

    <DetailsPill
      :active="isModalActive"
      @click="isModalActive = true"
    />
  </div>

  <DetailsModal
    v-model="isModalActive"
    :session="session"
    :position="position"
  />
</template>
