<template>
    <div class="flex flex-col items-center justify-center gap-4">
        <div class="flex w-full justify-between items-center" v-if="needed">
            <div >
            </div>

            <Switch
                v-model="enabled"
            />
        </div>

        <Button
            :disabled="disabled"
            :label="label"
            :loading="loading"
            @click="submit"
            expanded
        />
    </div>

    <Modal
      v-model="open"
      :teleport="autoTeleport"
      @retry="retry"
    />
</template>

<script setup lang="ts">
import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { computed, defineProps, ref, watchEffect } from 'vue'
import Modal from './components/Modal.vue'
import Button from './components/ui/Button/Button.vue'
import Switch from './components/ui/Switch/Switch.vue'
import useAutoTeleport from './composables/useAutoTeleport'
import eventBus from './utils/event-bus'

const props = defineProps<{
	sdk: AutoTeleportSDK
	autoteleport: TeleportParams
}>()

const open = ref(false)

const {
	enabled,
	needed,
	teleport,
	loading: autotelportLoading,
	autoTeleport,
	retry,
} = useAutoTeleport(props.sdk, props.autoteleport)

const disabled = computed(() => !enabled.value || autotelportLoading.value)

const loading = computed(() => autotelportLoading.value)

const label = computed(() => {
	if (needed.value && !enabled.value) {
		return `Not enough funds on ${props.autoteleport.chain}`
	}

	return loading.value ? 'Loading...' : 'Teleport'
})

const submit = async () => {
	eventBus.emit('teleport:submit', needed.value)

	if (needed.value) {
		await teleport()
	}
}

watchEffect(() => {
	if (autoTeleport.value) {
		open.value = true
	}
})
</script>
