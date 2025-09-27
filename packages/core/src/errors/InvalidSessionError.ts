import { SDKError, type SDKErrorOptions } from './types'

export default class InvalidSessionError extends SDKError {
	constructor(message: string, options: SDKErrorOptions = {}) {
		super(message, {
			code: 'INVALID_SESSION_ERROR',
			...options,
		})
	}
}
