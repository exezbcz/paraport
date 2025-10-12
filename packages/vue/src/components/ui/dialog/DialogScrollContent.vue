<script setup lang="ts">
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'
import {
	DialogClose,
	DialogContent,
	type DialogContentEmits,
	type DialogContentProps,
	DialogOverlay,
	DialogPortal,
	useForwardPropsEmits,
} from 'reka-ui'
import { type HTMLAttributes, computed } from 'vue'
import { useSdk } from '@/composables/useSdk'

const props = defineProps<
	DialogContentProps & { class?: HTMLAttributes['class'] }
>()
const emits = defineEmits<DialogContentEmits>()

const delegatedProps = computed(() => {
	const { class: _, ...delegated } = props

	return delegated
})

const forwarded = useForwardPropsEmits(delegatedProps, emits)
const { appearance } = useSdk()
</script>

<template>
  <DialogPortal>
    <div class="paraport" :style="appearance">
      <DialogOverlay
        class="pp-fixed pp-inset-0 pp-z-[999] pp-grid pp-place-items-center pp-overflow-y-auto pp-bg-black/80 data-[state=open]:pp-animate-in data-[state=closed]:pp-animate-out data-[state=closed]:pp-fade-out-0 data-[state=open]:pp-fade-in-0"
      >
        <DialogContent
          :class="
            cn(
              'pp-relative pp-z-[999] pp-grid pp-w-full pp-max-w-xs pp-my-8 pp-gap-4 pp-border pp-border-border pp-bg-background pp-p-6 pp-shadow-lg pp-duration-200 sm:pp-rounded-lg md:pp-w-full',
              props.class,
            )
          "
          v-bind="forwarded"
          @pointer-down-outside="(event) => {
            const originalEvent = event.detail.originalEvent;
            const target = originalEvent.target as HTMLElement;
            if (originalEvent.offsetX > target.clientWidth || originalEvent.offsetY > target.clientHeight) {
              event.preventDefault();
            }
          }"
        >
          <slot />

          <DialogClose
            class="pp-absolute pp-ring-pink-200 pp-top-3 pp-right-3 pp-p-0.5 pp-transition-colors pp-rounded-md hover:pp-bg-secondary"
          >
            <X class="pp-w-4 pp-h-4" />
            <span class="pp-sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </DialogOverlay>
    </div>
  </DialogPortal>
</template>
