import type { AutoTeleportSDK, TeleportParams } from '@autoteleport/core'
import { computed, onBeforeMount, ref, watchEffect } from 'vue'

export default (sdk: AutoTeleportSDK, params: TeleportParams) => {
	const session = ref<Awaited<ReturnType<AutoTeleportSDK['autoteleport']>>>()
	const loading = ref(true)
	const enabled = ref(false)

	const selectedQuote = computed(() => session.value?.quotes[0])
	const needed = computed(() => Boolean(session.value?.needed))

	const teleport = async () => {
		if (selectedQuote.value) {
			await sdk.teleport(params, selectedQuote.value)
		}
	}

	onBeforeMount(async () => {
		if (!sdk.isInitialized()) {
			await sdk.initialize()
		}

		sdk.on('teleport:updated', (teleport) => {
			console.log(`[UI] Teleport Updated`, teleport)
		})

		sdk.on('teleport:completed', (teleport) => {
			console.log(`[UI] Teleport completed`, teleport)
		})

		session.value = await sdk.autoteleport(params)

		loading.value = false

		console.log('Quotes', session.value?.quotes)
	})

	watchEffect(() => {
		if (session.value) {
			enabled.value = session.value.needed
		}
	})

	return {
		loading,
		enabled,
		session,
		needed,
		teleport,
	}
}
