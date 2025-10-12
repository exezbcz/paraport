import { type BaseDetailsEvent, BaseManager } from '@/base/BaseManager'
import type { GenericEmitter } from '@/base/GenericEmitter'
import type { BridgeTransferParams } from '@/types/bridges'
import {
	type TransactionDetails,
	type TransactionEventType,
	TransactionEventTypes,
	type TransactionStatus,
	TransactionStatuses,
	type TransactionType,
} from '@/types/transactions'
import type { Chain } from '@paraport/static'

export class TransactionManager extends BaseManager<
	TransactionDetails,
	TransactionStatus,
	BaseDetailsEvent,
	TransactionEventType,
	TransactionDetails // event payload
> {
	constructor(
		eventEmitter: GenericEmitter<TransactionDetails, TransactionEventType>,
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
		details: BridgeTransferParams
		order: number
	}): TransactionDetails {
		const transaction: TransactionDetails = {
			id,
			teleportId,
			status: TransactionStatuses.Unknown,
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

	protected getUpdateEventType(): TransactionEventType {
		return TransactionEventTypes.TRANSACTION_UPDATED
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
			transaction.status === TransactionStatuses.Cancelled ||
			Boolean(transaction.error)
		)
	}

	resetTransaction(transaction: TransactionDetails): void {
		transaction.unsubscribe?.()

		this.updateStatus(transaction.id, TransactionStatuses.Unknown, {
			error: undefined,
			succeeded: undefined,
			txHash: undefined,
			unsubscribe: undefined,
		})
	}

	/**
	 * Unsubscribes active watchers, clears items and listeners.
	 */
	destroy(): void {
		// Unsubscribe any active watchers and clear items
		for (const tx of this.getAllItems()) {
			tx.unsubscribe?.()
		}
		this.items.clear()
		// Remove all event listeners on this manager's emitter
		this.eventEmitter.removeAllListeners()
	}
}
