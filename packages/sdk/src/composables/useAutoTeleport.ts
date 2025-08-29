import eventBus from '@/utils/event-bus'
import {
	AutoTeleportSessionEventType,
	type ParaPortSDK,
	type TeleportEventPayload,
	type TeleportParams,
	TeleportSessionStatus,
} from '@paraport/core'
import { TeleportEventType, type TeleportSession } from '@paraport/core'
import { computed, onBeforeMount, ref, watchEffect } from 'vue'

const TELEPORT_EVENTS = [
	TeleportEventType.TELEPORT_COMPLETED,
	TeleportEventType.TELEPORT_STARTED,
	TeleportEventType.TELEPORT_UPDATED,
]

const SESSION_EVENTS = [
	AutoTeleportSessionEventType.SESSION_CREATED,
	AutoTeleportSessionEventType.SESSION_UPDATED,
	AutoTeleportSessionEventType.SESSION_DELETED,
]

export default (sdk: ParaPortSDK, params: TeleportParams<string>) => {
	const session = ref<TeleportSession>()
	const autoteleport = ref<TeleportEventPayload>()

	const loading = ref(true)
	const enabled = ref(false)

	const selectedQuote = computed(() => session.value?.quotes.selected)

	const exec = async () => {
		if (session.value && selectedQuote.value) {
			await sdk.executeSession(session.value.id)
		}
	}

	const attachListeners = () => {
		for (const event of SESSION_EVENTS) {
			sdk.onSession(event, (payload) => {
				console.log(`[UI] ${event}`, payload)

				if (payload.status === TeleportSessionStatus.Ready && !session.value) {
					eventBus.emit('session:ready')
				}

				session.value = payload
			})
		}

		for (const event of TELEPORT_EVENTS) {
			sdk.onTeleport(event, (payload) => {
				console.log(`[UI] ${event}`, payload)
				autoteleport.value = payload

				if (event === TeleportEventType.TELEPORT_COMPLETED) {
					eventBus.emit('teleport:completed')
				}
			})
		}
	}

	const retry = async () => {
		if (!session.value) return

		sdk.retrySession(session.value.id)
	}

	onBeforeMount(async () => {
		if (!sdk.isInitialized()) {
			await sdk.initialize()
		}

		attachListeners()

		session.value = await sdk.initSession(params)

		loading.value = false

		console.log('Session', session.value)

		console.log('Quotes', session.value?.quotes)
	})

	const isReady = computed(
		() => session.value?.status === TeleportSessionStatus.Ready,
	)
	const isAvailable = computed(() => true) // TODO check if chain has autoteleport support
	const canAutoTeleport = computed(
		() => isAvailable.value && Boolean(session.value?.funds.available),
	)
	const insufficientFunds = computed(
		() => isReady.value && hasNoFundsAtAll.value,
	)
	const needsAutoTeleport = computed(() => Boolean(session.value?.funds.needed))
	const hasNoFundsAtAll = computed(() =>
		Boolean(session.value?.funds.noFundsAtAll),
	)
	const hasEnoughInCurrentChain = computed(
		() => !needsAutoTeleport.value && isReady.value,
	)

	watchEffect(() => {
		if (session.value) {
			enabled.value = needsAutoTeleport.value
		}
	})

	return {
		enabled, // todo remove
		needsAutoTeleport,
		hasEnoughInCurrentChain,
		exec,
		autoteleport,
		session,
		retry,
		isReady,
		isAvailable,
		canAutoTeleport,
		hasNoFundsAtAll,
		insufficientFunds,
	}
}
