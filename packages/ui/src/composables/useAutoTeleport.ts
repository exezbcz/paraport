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
	const autoteleport = ref<TeleportEventPayload>()
	const retry = ref<() => void>()

	const selectedQuote = computed(() => session.value?.quotes[0])

	const exec = async () => {
		if (selectedQuote.value) {
			const response = await sdk.teleport(params, selectedQuote.value)
			retry.value = response.retry
		}
	}

	const attachListeners = () => {
		for (const event of TELEPORT_EVENTS) {
			sdk.on(event, (teleport) => {
				console.log(`[UI] ${event}`, teleport)
				autoteleport.value = teleport

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

	const isReady = computed(() => !loading.value && Boolean(session.value))
	const isAvailable = computed(() => true) // TODO
	const canAutoTeleport = computed(
		() => isAvailable.value && Boolean(session.value?.available),
	)
	const needsAutoTeleport = computed(() => Boolean(session.value?.needed))
	const hasNoFundsAtAll = computed(() => Boolean(session.value?.noFundsAtAll))
	const hasEnoughInCurrentChain = computed(
		() => !needsAutoTeleport.value && isReady.value,
	)

	watchEffect(() => {
		if (session.value) {
			enabled.value = session.value.needed
		}
	})

	return {
		enabled,
		needsAutoTeleport,
		hasEnoughInCurrentChain,
		exec,
		autoteleport,
		retry,
		isReady,
		isAvailable,
		canAutoTeleport,
		hasNoFundsAtAll,
	}
}
