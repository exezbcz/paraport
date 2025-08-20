import { type BaseDetailsEvent, BaseManager } from '@/base/BaseManager'
import type { GenericEmitter } from '@/base/GenericEmitter'
import type { BrigeTransferParams } from '@/types/bridges'
import type { Chain } from '@/types/common'
import {
	type TransactionDetails,
	TransactionEventType,
	type TransactionEventTypeString,
	TransactionStatus,
	type TransactionType,
} from '@/types/transactions'

export class TransactionManager extends BaseManager<
	TransactionDetails,
	TransactionStatus,
	BaseDetailsEvent,
	TransactionEventTypeString,
	TransactionDetails // event payload
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
		details: BrigeTransferParams
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

	isTransactionFailed(transaction: TransactionDetails): boolean {
		return (
			transaction.status === TransactionStatus.Cancelled ||
			Boolean(transaction.error)
		)
	}

	resetTransaction(transaction: TransactionDetails): void {
		transaction.unsubscribe?.()

		this.updateStatus(transaction.id, TransactionStatus.Unknown, {
			error: undefined,
			succeeded: undefined,
			txHash: undefined,
			unsubscribe: undefined,
		})
	}
}
