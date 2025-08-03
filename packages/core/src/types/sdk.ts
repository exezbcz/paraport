import type { Quote } from './common'
import type { TeleportEventType, TeleportParams } from './teleport'

export enum TeleportSessionStatus {
	Pending = 'pending',
	Ready = 'ready',
	Executing = 'executing',
	Completed = 'completed',
	Failed = 'failed',
}

export type AutoTeleportSessionCalculation = {
	quotes: Quote[]
	needed: boolean
	available: boolean
	noFundsAtAll: boolean
}

export type TeleportSession = {
	id: string
	status: TeleportSessionStatus
	params: TeleportParams
	selectedQuote?: Quote
	unsubscribe: () => void
} & AutoTeleportSessionCalculation

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
