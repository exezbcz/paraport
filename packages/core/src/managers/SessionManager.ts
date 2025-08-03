import { type TeleportSession, TeleportSessionStatus } from '../types/sdk'
import type { TeleportParams } from '../types/teleport'

export default class SessionManager {
	private sessions = new Map<string, TeleportSession>()

	createSession(
		params: TeleportParams,
		initialState: Partial<TeleportSession>,
	): string {
		const sessionId = crypto.randomUUID()

		const session: TeleportSession = {
			id: sessionId,
			status: TeleportSessionStatus.Pending,
			params,
			quotes: [],
			needed: false,
			available: false,
			noFundsAtAll: false,
			unsubscribe: () => {},
			...initialState,
		}

		this.sessions.set(sessionId, session)

		return sessionId
	}

	getSession(sessionId: string): TeleportSession | undefined {
		return this.sessions.get(sessionId)
	}

	updateSession(sessionId: string, updates: Partial<TeleportSession>) {
		const session = this.sessions.get(sessionId)
		if (session) {
			this.sessions.set(sessionId, { ...session, ...updates })
		}
	}

	removeSession(sessionId: string) {
		const session = this.sessions.get(sessionId)
		if (session) {
			session.unsubscribe()
			this.sessions.delete(sessionId)
		}
	}
}
