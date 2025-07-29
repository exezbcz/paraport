<template>
    <Modal v-model="isOpen"
        content-class="min-w-[400px]"
        :title="$t('autoteleport.title')"
    >
        <Steps :items="steps"
            @retry="emit('retry')"
        />
    </Modal>
</template>

<script setup lang="ts">
import type { TeleportEventPayload } from '@autoteleport/core'
import { computed } from 'vue'
import useTeleportSteps from '../composables/useTeleportSteps'
import Steps from './Steps.vue'
import Modal from './ui/Modal/Modal.vue'

const emit = defineEmits(['retry'])
const props = defineProps<{
	teleport?: TeleportEventPayload
}>()

const isOpen = defineModel<boolean>()
const steps = useTeleportSteps(computed(() => props.teleport))
</script>
