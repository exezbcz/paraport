<template>
    <div class="flex items-center gap-5">
        <div class="flex gap-4 text-xs capitalize">
            <span>
                <span class="text-secondary">~ </span>
                <span>1 mins</span>
            </span>
            <span> 1 signature </span>
        </div>

        <DetailsPill />
    </div>
</template>
<script setup lang="ts">
import { type TeleportSession } from '@paraport/core'
import DetailsPill from './DetailsPill.vue'

defineProps<{
	session: TeleportSession
}>()
</script>
