import { SDKError, type SDKErrorOptions } from './types'

export default class InvalidTeleportParamsError extends SDKError {
	constructor(message: string, options: SDKErrorOptions = {}) {
		super(message, {
			code: 'INVALID_TELEPORT_PARAMS_ERROR',
			...options,
		})
	}
}
