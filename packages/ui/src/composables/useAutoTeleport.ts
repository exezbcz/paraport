import type {
	AutoTeleportSDK,
	TeleportEventPayload,
	TeleportParams,
} from '@autoteleport/core'
import { TeleportEventType } from '@autoteleport/core'
import { computed, onBeforeMount, ref, watchEffect } from 'vue'
import eventBus from '../utils/event-bus'

const TELEPORT_EVENTS = [
	TeleportEventType.TELEPORT_COMPLETED,
	TeleportEventType.TELEPORT_STARTED,
	TeleportEventType.TELEPORT_UPDATED,
]

export default (sdk: AutoTeleportSDK, params: TeleportParams) => {
	const session = ref<Awaited<ReturnType<AutoTeleportSDK['autoteleport']>>>()
	const loading = ref(true)
	const enabled = ref(false)
	const autoTeleport = ref<TeleportEventPayload>()
	const retry = ref<() => void>()

	const selectedQuote = computed(() => session.value?.quotes[0])
	const needed = computed(() => Boolean(session.value?.needed))

	const teleport = async () => {
		if (selectedQuote.value) {
			const response = await sdk.teleport(params, selectedQuote.value)
			retry.value = response.retry
		}
	}

	const attachListeners = () => {
		for (const event of TELEPORT_EVENTS) {
			sdk.on(event, (teleport) => {
				console.log(`[UI] ${event}`, teleport)
				autoTeleport.value = teleport

				if (event === TeleportEventType.TELEPORT_COMPLETED) {
					eventBus.emit('teleport:completed')
				}
			})
		}
	}

	onBeforeMount(async () => {
		if (!sdk.isInitialized()) {
			await sdk.initialize()
		}

		attachListeners()

		session.value = await sdk.autoteleport(params)

		loading.value = false

		console.log('Session', session.value)

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
		autoTeleport,
		retry,
	}
}
