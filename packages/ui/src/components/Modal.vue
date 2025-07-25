<template>
    <Modal v-model="isOpen"
    title="Sign Transactions"
    >
        <Transactions :items="teleport?.transactions || []"/>
    </Modal>
</template>

<script setup lang="ts">
import type { TeleportEventPayload } from '@autoteleport/core'
import Transactions from './Transactions.vue'

import Modal from './ui/Modal/Modal.vue'

const isOpen = defineModel<boolean>()

const props = defineProps<{
	teleport?: TeleportEventPayload
}>()
</script>
