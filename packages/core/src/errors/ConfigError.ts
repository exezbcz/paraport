import { SDKError, type SDKErrorOptions } from './types'

export default class ConfigValidationError extends SDKError {
	constructor(message: string, options: SDKErrorOptions = {}) {
		super(message, {
			code: 'CONFIG_VALIDATION_ERROR',
			...options,
		})
	}
}
