import type { BaseDetails, BaseDetailsEvent } from '@/base/BaseManager'
import type { Quote } from '@/types/common'
import type { TeleportParams } from '@/types/teleport'

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

export enum AutoTeleportSessionEventType {
	SESSION_CREATED = 'session:created',
	SESSION_UPDATED = 'session:updated',
	SESSION_DELETED = 'session:deleted',
	SESSION_COMPLETED = 'session:completed',
	SESSION_FAILED = 'session:failed',
}

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
