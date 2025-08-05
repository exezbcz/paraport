import { LogLevel, type LoggerConfig } from '@/types/sdk'

export class Logger {
	private config: LoggerConfig

	constructor(config?: Partial<LoggerConfig>) {
		this.config = {
			minLevel: LogLevel.INFO,
			prefix: '[AutoTeleportSDK]',
			...config,
		}
	}

	debug(message: string, data?: unknown): void {
		this.log(LogLevel.DEBUG, message, data)
	}

	info(message: string, data?: unknown): void {
		this.log(LogLevel.INFO, message, data)
	}

	warn(message: string, data?: unknown): void {
		this.log(LogLevel.WARN, message, data)
	}

	error(message: string, error?: unknown): void {
		this.log(LogLevel.ERROR, message, error)
	}

	private log(level: LogLevel, message: string, data?: unknown): void {
		if (this.shouldLog(level)) {
			const prefix = this.config.prefix ? `[${this.config.prefix}] ` : ''
			const formattedMsg = `${level} ${prefix}${message}`

			switch (level) {
				case LogLevel.ERROR:
					console.error(formattedMsg, data || '')
					break
				case LogLevel.WARN:
					console.warn(formattedMsg, data || '')
					break
				case LogLevel.INFO:
					console.info(formattedMsg, data || '')
					break
				case LogLevel.DEBUG:
					console.debug(formattedMsg, data || '')
					break
			}
		}
	}

	private shouldLog(level: LogLevel): boolean {
		const levels = [
			LogLevel.DEBUG,
			LogLevel.INFO,
			LogLevel.WARN,
			LogLevel.ERROR,
		]
		return levels.indexOf(level) >= levels.indexOf(this.config.minLevel)
	}
}
