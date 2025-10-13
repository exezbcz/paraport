<script lang="ts" setup>
defineProps<{
  topClasses?: string
}>()
</script>

<template>
  <div class="pp-relative pp-bg-background pp-rounded-xl">
    <div
      class="pp-relative pp-z-10 pp-h-12"
      :class="[
        { 'pp-border pp-rounded-xl pp-border-surface-grey pp-flex pp-px-4 pp-py-2': $slots.top },
        topClasses,
      ]"
    >
      <slot name="action" />

      <slot name="top" />
    </div>

    <div v-if="$slots.bottom" class="pp-h-[50px] pp-px-4 pp-py-2 pp-flex pp-justify-between pp-items-center pp-border-r pp-border-b pp-border-l pp-border-surface-grey pp-rounded-b-xl pp--mt-2 pp-pt-4">
      <slot name="bottom" />
    </div>
  </div>
</template>
