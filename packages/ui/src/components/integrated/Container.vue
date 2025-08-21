<template>
  <div class="relative bg-background rounded-xl">
    <div
        class="relative z-10 h-12"
        :class="{'border-b rounded-xl border-surface-grey flex px-4 py-2': $slots.top}"
    >
      <slot name="action"/>

      <slot name="top"/>
    </div>

    <div v-if="$slots.bottom" class="h-[50px] px-4 py-2 flex justify-between items-center border-r border-b border-l border-surface-grey rounded-b-xl -mt-2 pt-4">
      <slot name="bottom" />
    </div>
  </div>
</template>
