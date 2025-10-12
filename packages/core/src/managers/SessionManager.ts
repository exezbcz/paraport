import { BaseManager } from '@/base/BaseManager'
import {
	type AutoTeleportSessionEventType,
	AutoTeleportSessionEventTypes,
	type TeleportSession,
	type TeleportSessionEvent,
	type TeleportSessionPayload,
	type TeleportSessionStatus,
	TeleportSessionStatuses,
} from '@/types/sdk'
import type { TeleportParams } from '@/types/teleport'

/**
 * Tracks auto-teleport sessions and synchronizes state derived
 * from quotes, funds availability, and teleport progress.
 */
export default class SessionManager extends BaseManager<
	TeleportSession,
	TeleportSessionStatus,
	TeleportSessionEvent,
	AutoTeleportSessionEventType,
	TeleportSessionPayload
> {
	/**
	 * Creates a new session with initial state and emits SESSION_CREATED.
	 *
	 * @param params - Teleport parameters
	 * @param initialState - Optional initial session fields
	 * @returns The created session id
	 */
	createSession(
		params: TeleportParams,
		initialState: Partial<TeleportSession>,
	): string {
		const sessionId = crypto.randomUUID()

		const session: TeleportSession = {
			id: sessionId,
			status: TeleportSessionStatuses.Pending,
			params,
			quotes: {
				available: [],
				selected: undefined,
				bestQuote: undefined,
			},
			funds: {
				needed: false,
				available: false,
				noFundsAtAll: false,
			},
			events: [],
			teleportId: undefined,
			unsubscribe: () => {},
			timestamp: Date.now(),
			...initialState,
		}

		this.setItem(sessionId, session, false)

		this.eventEmitter.emit({
			type: AutoTeleportSessionEventTypes.SESSION_CREATED,
			payload: session,
		})

		return sessionId
	}

	/**
	 * Updates an existing session and emits SESSION_UPDATED.
	 */
	updateSession(sessionId: string, updates: Partial<TeleportSession>) {
		const session = this.getItem(sessionId)
		if (session) {
			this.setItem(sessionId, { ...session, ...updates })
		}
	}

	/**
	 * Removes a session and cleans up its subscription.
	 */
	removeSession(sessionId: string) {
		const session = this.getItem(sessionId)
		if (session) {
			session.unsubscribe()
			this.removeItem(sessionId)
		}
	}

	/**
	 * Event channel used when emitting session updates.
	 * @returns Session update event type
	 */
	getUpdateEventType() {
		return AutoTeleportSessionEventTypes.SESSION_UPDATED
	}

	/**
	 * Finds a session belonging to a specific teleport.
	 * @param teleportId - Teleport identifier
	 * @returns Matching session or undefined
	 */
	getSessionByTeleportId(teleportId: string): TeleportSession | undefined {
		return this.getItemsWhere((session) => session.teleportId === teleportId)[0]
	}

	/**
	 * Cleans up all sessions and listeners.
	 */
	destroy(): void {
		for (const session of this.getAllItems()) {
			try {
				session.unsubscribe?.()
			} catch {
				// ignore
			}
		}
		this.items.clear()
		this.eventEmitter.removeAllListeners()
	}
}
