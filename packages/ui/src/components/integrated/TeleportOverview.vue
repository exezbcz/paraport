<template>
    <div class="flex items-center gap-5">
        <div class="flex gap-1 text-xs capitalize">
            <Time
                :value="30000"
                devider-class="!text-secondary"
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
        v-model="isModalActive"
        :session="session"
    />
</template>
<script setup lang="ts">
import Time from '@components/common/Time.vue'
import DetailsModal from '@components/integrated/DetailsModal.vue'
import { type TeleportSession } from '@paraport/core'
import { ref } from 'vue'
import DetailsPill from './DetailsPill.vue'

defineProps<{
	session: TeleportSession
}>()

const isModalActive = ref(false)
</script>
