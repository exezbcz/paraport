<template>
    <div class="flex items-center gap-5">
        <div class="flex gap-1 text-xs capitalize">
            <Time
                :value="Number(session.quotes.selected?.execution.timeMs)"
                devider-class="!text-secondary"
				short
            />
            <div class="w-1 h-1 rounded-full bg-surface-grey self-center" />
            <span> {{ session.quotes.selected?.execution.signatureAmount }} signature </span>
        </div>

        <DetailsPill
            :active="isModalActive"
            @click="isModalActive = true"
        />
    </div>

    <DetailsModal
        ref="modalRef"
        v-model="isModalActive"
        :session="session"
        :position="position"
    />
</template>
<script setup lang="ts">
import Time from '@components/common/Time.vue'
import DetailsModal from '@components/integrated/DetailsModal.vue'
import { type TeleportSession } from '@paraport/core'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { Ref, computed, ref } from 'vue'
import DetailsPill from './DetailsPill.vue'

const props = defineProps<{
	session: TeleportSession
	buttonRef: Ref<HTMLButtonElement | null>
}>()

const isModalActive = ref(false)

const MODAL_HEIGHT = 397
const MODAL_WIDTH = 320

const VIEWPORT_MARGIN = 10
const BUTTON_SPACING = 10
const MIN_TOP_SPACING = 10

const buttonBounds = useElementBounding(props.buttonRef)

const { width: windowWidth } = useWindowSize()

const position = computed(() => {
	// Center horizontally relative to button
	const left =
		buttonBounds.left.value + buttonBounds.width.value / 2 - MODAL_WIDTH / 2

	const spaceAbove = buttonBounds.top.value
	const spaceBelow =
		windowWidth.value - (buttonBounds.top.value + buttonBounds.height.value)

	const shouldPositionBelow =
		spaceBelow >= MODAL_HEIGHT + BUTTON_SPACING &&
		spaceAbove < MODAL_HEIGHT + BUTTON_SPACING

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
