<template>
    <div class="flex flex-col gap-6">
        <TransactionItem v-for="item in items" :key="item.id" :transaction="item" />
    </div>
</template>

<script setup lang="ts">
import type { TeleportEventPayload } from '@autoteleport/core'
import TransactionItem from './TransactionItem.vue'

const props = defineProps<{
	items: TeleportEventPayload['transactions']
}>()
</script>
