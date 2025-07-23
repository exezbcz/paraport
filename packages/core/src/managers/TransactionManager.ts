import { type BaseDetailsEvent, BaseManager } from '../base/BaseManager'
import type { Action, Chain } from '../types'
import {
	type BrigeTransferParams,
	type TransactionDetails,
	TransactionStatus,
	type TransactionType,
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
	BaseDetailsEvent,
	TransactionEventTypeString,
	TransactionDetails, // event payload
	{ txHash?: string; error?: string }
> {
	constructor(
		eventEmitter: GenericEmitter<
			TransactionDetails,
			TransactionEventTypeString
		>,
	) {
		super(eventEmitter)
	}

	createTransaction({
		chain,
		teleportId,
		type,
		details,
		order,
		id,
	}: {
		id: string
		chain: Chain
		teleportId: string
		type: TransactionType
		details: BrigeTransferParams | Action
		order: number
	}): TransactionDetails {
		const transaction: TransactionDetails = {
			id,
			teleportId,
			status: TransactionStatus.Unknown,
			chain: chain,
			details: details,
			events: [],
			timestamp: Date.now(),
			type,
			order,
		}

		this.setItem(id, transaction, false)

		return transaction
	}

	protected getUpdateEventType(): TransactionEventTypeString {
		return TransactionEventType.TRANSACTION_UPDATED
	}

	getTelportTransactions(
		teleportId: string,
		{ type }: { type?: TransactionType } = {},
	) {
		return this.getItemsWhere(
			(transaction) =>
				transaction.teleportId === teleportId &&
				(!type || transaction.type === type),
		)
	}
}
