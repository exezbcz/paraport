<template>
    <div class="button-wrapper">
        <div class="top-container" v-if="!loading">
            <div >
                <!-- Img container -->
            </div>

            <Switch
                v-model="enabled"
            />
        </div>

        <Button
            expanded
            :disabled="disabled"
            :label="label"
            @click="teleport"
        />
    </div>
</template>

<script setup lang="ts">
import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { computed, defineProps } from 'vue'
import useAutoTeleport from '../composables/useAutoTeleport'
import Button from './ui/Button/Button.vue'
import Switch from './ui/Switch/Switch.vue'

const props = defineProps<{
	sdk: AutoTeleportSDK
	autoteleport: TeleportParams
}>()

const { enabled, needed, teleport, loading } = useAutoTeleport(
	props.sdk,
	props.autoteleport,
)

const disabled = computed(() => !enabled.value || loading.value)

const label = computed(() => {
	if (needed.value && !enabled.value) {
		return 'Not enough funds on source chain'
	}

	return loading.value ? 'Loading...' : 'Teleport'
})
</script>

<style scoped>
.button-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    width: 100%;
    flex-direction: column;
    gap: 12px;

    .top-container {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
}
</style>
