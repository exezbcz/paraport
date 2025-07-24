<template>
    <div class="flex flex-col items-center justify-center gap-4">
        <div class="flex w-full justify-between items-center" v-if="!loading">
            <div >
            </div>

            <Switch
                v-model="enabled"
            />
        </div>

        <Button
            expanded
            :disabled="disabled"
            :label="label"
            :loading="loading"
            @click="teleport"
        />
    </div>

    <Modal v-model="open" />
</template>

<script setup lang="ts">
import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { computed, defineProps, ref, watchEffect } from 'vue'
import useAutoTeleport from './composables/useAutoTeleport'
import Modal from './components/Modal.vue'
import Button from './components/ui/Button/Button.vue'
import Switch from './components/ui/Switch/Switch.vue'

const props = defineProps<{
	sdk: AutoTeleportSDK
	autoteleport: TeleportParams
}>()

const open = ref(false)

const { enabled, needed, teleport, loading: autotelportLoading, autoTeleport } = useAutoTeleport(
	props.sdk,
	props.autoteleport,
)

const disabled = computed(() => !enabled.value || autotelportLoading.value)

const loading = computed(() => autotelportLoading.value)

const label = computed(() => {
	if (needed.value && !enabled.value) {
		return 'Not enough funds on source chain'
	}

	return loading.value ? 'Loading...' : 'Teleport'
})

watchEffect(() => {
	if (autoTeleport.value) {
		open.value = true
	}
})
</script>
