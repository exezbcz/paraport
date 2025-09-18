import { SDKError, type SDKErrorOptions } from './types'

export default class SDKInitializationError extends SDKError {
	constructor(message: string, options: SDKErrorOptions = {}) {
		super(message, {
			code: 'SDK_INITIALIZATION_ERROR',
			...options,
		})
	}
}
