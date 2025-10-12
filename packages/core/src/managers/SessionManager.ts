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

export default class SessionManager extends BaseManager<
	TeleportSession,
	TeleportSessionStatus,
	TeleportSessionEvent,
	AutoTeleportSessionEventType,
	TeleportSessionPayload
> {
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

	updateSession(sessionId: string, updates: Partial<TeleportSession>) {
		const session = this.getItem(sessionId)
		if (session) {
			this.setItem(sessionId, { ...session, ...updates })
		}
	}

	removeSession(sessionId: string) {
		const session = this.getItem(sessionId)
		if (session) {
			session.unsubscribe()
			this.removeItem(sessionId)
		}
	}

	getUpdateEventType() {
		return AutoTeleportSessionEventTypes.SESSION_UPDATED
	}

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
