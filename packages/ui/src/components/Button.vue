<template>
    <div class="button-wrapper">
        <div class="top-container">
            <div >
                <!-- Img container -->
            </div>

            <Switch
                v-model="enabled"
            />
        </div>

        <Button
            expanded
            :disabled="laoding"
            :label="label"
            @click="teleport"
        />
    </div>
</template>

<script setup lang="ts">
import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { computed, defineProps, onBeforeMount, ref } from 'vue'
import Button from './ui/Button/Button.vue'
import Switch from './ui/Switch/Switch.vue'

const props = defineProps<{
	sdk: AutoTeleportSDK
	autoteleport: TeleportParams
}>()

const laoding = ref(true)
const enabled = ref(false)

const label = computed(() => {
	return laoding.value ? 'Loading...' : 'Teleport'
})

const teleport = async () => {
   await props.sdk.teleport(props.autoteleport)
}

onBeforeMount(async () => {
	console.log('AutoTeleportSDK', props.sdk)

	if (!props.sdk.isInitialized()) {
		await props.sdk.initialize()
	}

	const quotes = await props.sdk.getQuotes(props.autoteleport)

	laoding.value = false

	console.log('Quotes', quotes)
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
