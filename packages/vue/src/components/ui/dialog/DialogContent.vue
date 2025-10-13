<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import { X } from 'lucide-vue-next'
import {
  DialogClose,
  DialogContent,

  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed } from 'vue'
import { useSdk } from '@/composables/useSdk'
import { cn } from '@/lib/utils'

const props = defineProps<
  {
    class?: HTMLAttributes['class']
    overlay?: boolean
    position?: Record<string, string>
  } & DialogContentProps
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
    <!-- Scope dialog variables to SDK root to avoid host bleed-through -->
    <div class="paraport" :style="appearance">
      <DialogOverlay
        v-if="overlay"
        class="pp-fixed pp-inset-0 pp-z-[999] pp-bg-black/80 data-[state=open]:pp-animate-in data-[state=closed]:pp-animate-out data-[state=closed]:pp-fade-out-0 data-[state=open]:pp-fade-in-0"
      />

      <DialogContent
        v-bind="forwarded"
        :class="
          cn(
            'pp-fixed pp-z-[999] pp-grid pp-w-full pp-max-w-xs pp-gap-4 pp-border pp-border-border pp-rounded-lg pp-bg-background pp-p-5 pp-shadow-lg pp-duration-200 data-[state=open]:pp-animate-in data-[state=closed]:pp-animate-out data-[state=closed]:pp-fade-out-0 data-[state=open]:pp-fade-in-0 data-[state=closed]:pp-zoom-out-95 data-[state=open]:pp-zoom-in-95',
            !position && 'pp-left-1/2 pp-top-1/2 pp--translate-x-1/2 pp--translate-y-1/2 data-[state=closed]:pp-slide-out-to-left-1/2 data-[state=closed]:pp-slide-out-to-top-[48%] data-[state=open]:pp-slide-in-from-left-1/2 data-[state=open]:pp-slide-in-from-top-[48%]',
            props.class,
          )"
        :style="position"
      >
        <slot />

        <DialogClose
          class="pp-absolute pp-right-4 pp-top-5 pp-rounded-sm pp-opacity-70 pp-ring-offset-background pp-transition-opacity hover:pp-opacity-100 focus:pp-outline-none focus:pp-ring-2 focus:pp-ring-ring focus:pp-ring-offset-2 disabled:pp-pointer-events-none pp-data-[state=open]:pp-bg-accent pp-data-[state=open]:pp-text-muted-foreground"
        >
          <X class="pp-w-4 pp-h-4" />
          <span class="pp-sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </div>
  </DialogPortal>
</template>
