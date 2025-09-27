import { type LogLevel, LogLevels, type LoggerConfig } from '@/types/sdk'

export class Logger {
	private config: LoggerConfig

	constructor(config?: Partial<LoggerConfig>) {
		this.config = {
			minLevel: LogLevels.INFO,
			prefix: '[ParaPortSDK]',
			...config,
		}
	}

	debug(message: string, data?: unknown): void {
		this.log(LogLevels.DEBUG, message, data)
	}

	info(message: string, data?: unknown): void {
		this.log(LogLevels.INFO, message, data)
	}

	warn(message: string, data?: unknown): void {
		this.log(LogLevels.WARN, message, data)
	}

	error(message: string, error?: unknown): void {
		this.log(LogLevels.ERROR, message, error)
	}

	private log(level: LogLevel, message: string, data?: unknown): void {
		if (this.shouldLog(level)) {
			const prefix = this.config.prefix ? `[${this.config.prefix}] ` : ''
			const formattedMsg = `${level} ${prefix}${message}`

			switch (level) {
				case LogLevels.ERROR:
					console.error(formattedMsg, data || '')
					break
				case LogLevels.WARN:
					console.warn(formattedMsg, data || '')
					break
				case LogLevels.INFO:
					console.info(formattedMsg, data || '')
					break
				case LogLevels.DEBUG:
					console.debug(formattedMsg, data || '')
					break
			}
		}
	}

	private shouldLog(level: LogLevel): boolean {
		const levels = [
			LogLevels.DEBUG,
			LogLevels.INFO,
			LogLevels.WARN,
			LogLevels.ERROR,
		]
		return levels.indexOf(level) >= levels.indexOf(this.config.minLevel)
	}
}
