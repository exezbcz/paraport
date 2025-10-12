import { useSdk } from '@/composables/useSdk'
import eventBus from '@/utils/event-bus'
import {
	AutoTeleportSessionEventTypes,
	type TeleportEventPayload,
	TeleportSessionStatuses,
} from '@paraport/core'
import { TeleportEventTypes, type TeleportSession } from '@paraport/core'
import { computed, onBeforeMount, ref } from 'vue'

const TELEPORT_EVENTS = [
	TeleportEventTypes.TELEPORT_COMPLETED,
	TeleportEventTypes.TELEPORT_STARTED,
	TeleportEventTypes.TELEPORT_UPDATED,
]

const SESSION_EVENTS = [
	AutoTeleportSessionEventTypes.SESSION_CREATED,
	AutoTeleportSessionEventTypes.SESSION_UPDATED,
	AutoTeleportSessionEventTypes.SESSION_DELETED,
]

export default () => {
	const session = ref<TeleportSession>()
	const autoteleport = ref<TeleportEventPayload>()
	const loading = ref(true)

	const selectedQuote = computed(() => session.value?.quotes.selected)

	const { sdk, params } = useSdk()

	const exec = async () => {
		if (session.value && selectedQuote.value) {
			await sdk.value.executeSession(session.value.id)
		}
	}

	const attachListeners = () => {
		for (const event of SESSION_EVENTS) {
			sdk.value.onSession(event, (payload) => {
				console.log(`[UI] ${event}`, payload)

				if (
					payload.status === TeleportSessionStatuses.Ready &&
					!session.value
				) {
					eventBus.emit('session:ready', payload)
				}

				session.value = payload
			})
		}

		for (const event of TELEPORT_EVENTS) {
			sdk.value.onTeleport(event, (payload) => {
				console.log(`[UI] ${event}`, payload)
				autoteleport.value = payload

				if (event === TeleportEventTypes.TELEPORT_COMPLETED) {
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
		() => session.value?.status === TeleportSessionStatuses.Ready,
	)

	const isCompleted = computed(
		() => session.value?.status === TeleportSessionStatuses.Completed,
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
