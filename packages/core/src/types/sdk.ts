import type { BaseDetails, BaseDetailsEvent } from '../base/BaseManager'
import type { Quote } from './common'
import type { TeleportEventType, TeleportParams } from './teleport'

export enum TeleportSessionStatus {
	Pending = 'pending',
	Ready = 'ready',
	Executing = 'executing',
	Completed = 'completed',
	Failed = 'failed',
}

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

export enum AutoTeleportEventType {
	SESSION_CREATED = 'SESSION_CREATED',
	SESSION_UPDATED = 'SESSION_UPDATED',
	SESSION_DELETED = 'SESSION_DELETED',
}

export type AutoTeleportEventTypeSdk =
	| AutoTeleportEventType
	| `${AutoTeleportEventType}`
	| TeleportEventType
	| `${TeleportEventType}`

export enum LogLevel {
	DEBUG = 'DEBUG',
	INFO = 'INFO',
	WARN = 'WARN',
	ERROR = 'ERROR',
	NONE = 'NONE',
}

export interface LoggerConfig {
	minLevel: LogLevel
	prefix?: string
}
