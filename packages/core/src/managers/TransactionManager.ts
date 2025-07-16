import { BaseManager } from '../base/BaseManager'
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

	trackTransaction(id: string, params: any, quote: Quote): TransactionDetails {
		const transaction: TransactionDetails = {
			id,
			status: TransactionStatus.PENDING,
			params,
			quote,
			events: [],
			timestamp: Date.now(),
		}

		this.setItem(id, transaction)

		return transaction
	}

	protected getUpdateEventType(): TransactionEventTypeString {
		return TransactionEventType.TRANSACTION_UPDATED
	}
}
