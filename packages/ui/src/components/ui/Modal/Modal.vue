<template>
    <o-modal
        :active="value"
        class="sdk-modal"
    >
    <slot />
    </o-modal>
</template>

<script setup lang="ts">
import { OModal } from '@oruga-ui/oruga-next'

const value = defineModel<boolean>()
</script>
<style src="./Modal.scss" lang="scss" scoped></style>
