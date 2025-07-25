<template>
    <o-modal
        :active="value"
        class="sdk-modal"
    >

    <div class="px-8 py-6 border-b border-gray-200 flex justify-between items-center">
    <span>
    {{ title }}
    </span>

    <Icon
        icon="window-close"
        pack="mdi"
    />
    </div>

    <div class="px-8 py-4">
        <slot />
    </div>
    </o-modal>
</template>

<script setup lang="ts">
import { OModal } from '@oruga-ui/oruga-next'
import Icon from '../Icon/Icon.vue'

const value = defineModel<boolean>()

defineProps<{
	title?: string
}>()
</script>
<style src="./Modal.scss" lang="scss" scoped></style>
