import type { Quote } from './common'

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

export type AutoteleportResponse = {
	quotes: Quote[]
	needed: boolean
	available: boolean
	noFundsAtAll: boolean
}
