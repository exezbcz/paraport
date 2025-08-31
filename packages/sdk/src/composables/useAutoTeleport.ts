import { useSdkStore } from '@/stores'
import eventBus from '@/utils/event-bus'
import {
	AutoTeleportSessionEventType,
	type TeleportEventPayload,
	TeleportSessionStatus,
} from '@paraport/core'
import { TeleportEventType, type TeleportSession } from '@paraport/core'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, ref } from 'vue'

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

export default () => {
	const session = ref<TeleportSession>()
	const autoteleport = ref<TeleportEventPayload>()
	const loading = ref(true)

	const selectedQuote = computed(() => session.value?.quotes.selected)

	const { sdk, params } = storeToRefs(useSdkStore())

	const exec = async () => {
		if (session.value && selectedQuote.value) {
			await sdk.value.executeSession(session.value.id)
		}
	}

	const attachListeners = () => {
		for (const event of SESSION_EVENTS) {
			sdk.value.onSession(event, (payload) => {
				console.log(`[UI] ${event}`, payload)

				if (payload.status === TeleportSessionStatus.Ready && !session.value) {
					eventBus.emit('session:ready', payload)
				}

				session.value = payload
			})
		}

		for (const event of TELEPORT_EVENTS) {
			sdk.value.onTeleport(event, (payload) => {
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

		sdk.value.retrySession(session.value.id)
	}

	onBeforeMount(async () => {
		if (!sdk.value.isInitialized()) {
			await sdk.value.initialize()
		}

		attachListeners()

		session.value = await sdk.value.initSession(params.value)

		loading.value = false

		console.log('Session', session.value)

		console.log('Quotes', session.value?.quotes)
	})

	const isReady = computed(
		() => session.value?.status === TeleportSessionStatus.Ready,
	)

	const isCompleted = computed(
		() => session.value?.status === TeleportSessionStatus.Completed,
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

	return {
		needsAutoTeleport,
		hasEnoughInCurrentChain,
		exec,
		autoteleport,
		session,
		retry,
		isReady,
		isAvailable,
		isCompleted,
		canAutoTeleport,
		hasNoFundsAtAll,
		insufficientFunds,
	}
}
