import { BaseManager } from '../base/BaseManager'
import type { Action, Chain } from '../types'
import {
	type Quote,
	type TransactionDetails,
	type TransactionEvent,
	TransactionStatus,
} from '../types/bridges'
import type { GenericEmitter } from '../utils/GenericEmitter'

export enum TransactionEventType {
	TRANSACTION_STARTED = 'transaction:started',
	TRANSACTION_UPDATED = 'transaction:updated',
	TRANSACTION_PROCESSING = 'transaction:processing',
	TRANSACTION_COMPLETED = 'transaction:completed',
	TRANSACTION_FAILED = 'transaction:failed',
}

// type TransactionUpdatePayload = TransactionDetails;
export type TransactionEventTypeString = `${TransactionEventType}`

export class TransactionManager extends BaseManager<
	TransactionDetails,
	TransactionStatus,
	TransactionEvent,
	TransactionEventTypeString
> {
	constructor(
		eventEmitter: GenericEmitter<
			TransactionDetails,
			TransactionEventTypeString
		>,
	) {
		super(eventEmitter)
	}

	trackTransaction({
		action,
		chain,
		telportId,
	}: { action: Action; chain: Chain; telportId: string }): TransactionDetails {
		const id = crypto.randomUUID() as string

		const transaction: TransactionDetails = {
			id,
			telportId,
			status: TransactionStatus.PENDING,
			chain: chain,
			details: action,
			events: [],
			timestamp: Date.now(),
		}

		this.setItem(id, transaction, false)

		return transaction
	}

	protected getUpdateEventType(): TransactionEventTypeString {
		return TransactionEventType.TRANSACTION_UPDATED
	}
}
