import type { BaseDetails, BaseDetailsEvent } from '@/base/BaseManager'
import type { Quote } from '@/types/common'
import type { TeleportParams } from '@/types/teleport'
import type { ObjectValues } from './utils'

export const TeleportSessionStatuses = {
	Pending: 'pending',
	Ready: 'ready',
	Processing: 'processing',
	Completed: 'completed',
	Failed: 'failed',
} as const

export type TeleportSessionStatus = ObjectValues<typeof TeleportSessionStatuses>

interface FundsStatus {
	needed: boolean
	available: boolean
	noFundsAtAll: boolean
}

interface QuoteSelection {
	available: Quote[]
	selected?: Quote
	bestQuote?: Quote
}

export interface AutoTeleportSessionCalculation {
	quotes: QuoteSelection
	funds: FundsStatus
}

export interface TeleportSessionPayload extends TeleportSession {}

export interface TeleportSessionEvent extends BaseDetailsEvent {}

export interface TeleportSession
	extends AutoTeleportSessionCalculation,
		BaseDetails<TeleportSessionStatus, TeleportSessionEvent> {
	id: string
	status: TeleportSessionStatus
	params: TeleportParams
	teleportId?: string
	unsubscribe: () => void
}

export const AutoTeleportSessionEventTypes = {
	SESSION_CREATED: 'session:created',
	SESSION_UPDATED: 'session:updated',
	SESSION_DELETED: 'session:deleted',
	SESSION_COMPLETED: 'session:completed',
	SESSION_FAILED: 'session:failed',
} as const

export type AutoTeleportSessionEventType = ObjectValues<
	typeof AutoTeleportSessionEventTypes
>

export const LogLevels = {
	DEBUG: 'DEBUG',
	INFO: 'INFO',
	WARN: 'WARN',
	ERROR: 'ERROR',
} as const

export type LogLevel = ObjectValues<typeof LogLevels>

export interface LoggerConfig {
	minLevel: LogLevel
	prefix?: string
}
