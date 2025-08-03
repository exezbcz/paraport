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

export interface AutoTeleportSessionCalculation {
	quotes: Quote[]
	needed: boolean
	available: boolean
	noFundsAtAll: boolean
}

export interface TeleportSessionEvent extends BaseDetailsEvent {}

export interface TeleportSession
	extends AutoTeleportSessionCalculation,
		BaseDetails<TeleportSessionStatus, TeleportSessionEvent> {
	id: string
	status: TeleportSessionStatus
	params: TeleportParams
	selectedQuote?: Quote
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
