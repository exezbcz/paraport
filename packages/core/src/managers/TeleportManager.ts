import { BaseManager } from '../base/BaseManager'
import type {
	Quote,
	TeleportParams,
	TransactionDetails,
} from '../types/bridges'
import { GenericEmitter } from '../utils/GenericEmitter'
import {
	type TransactionEventTypeString,
	TransactionManager,
} from './TransactionManager'

type TeleportDetails = any

enum TeleportStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

enum TeleportEventType {
	TELEPORT_UPDATED = 'teleport:updated',
}

type TeleportEventTypeString = `${TeleportEventType}`

export class TeleportManager extends BaseManager<
	TeleportDetails,
	TeleportStatus,
	any,
	TeleportEventTypeString
> {
	private readonly transactionManager: TransactionManager

	constructor(
		teleportEventEmitter: GenericEmitter<
			TeleportDetails,
			TeleportEventTypeString
		>,
	) {
		super(teleportEventEmitter)
		this.transactionManager = new TransactionManager(
			new GenericEmitter<TransactionDetails, TransactionEventTypeString>(),
		)
	}

	async initiateTeleport(
		id: string,
		params: TeleportParams,
		quote: Quote,
	): Promise<TeleportDetails> {
		const teleport: TeleportDetails = {
			id,
			status: TeleportStatus.PENDING,
			params,
			quote,
			events: [],
			timestamp: Date.now(),
		}

		this.setItem(id, teleport)

		this.transactionManager.trackTransaction(
			id,
			{ type: 'teleport', details: params },
			quote,
		)

		return teleport
	}

	// Override updateStatus to also update the corresponding transaction
	updateStatus(id: string, status: TeleportStatus, error?: string): void {
		throw new Error('Method not implemented.')
	}

	protected getUpdateEventType(): TeleportEventTypeString {
		return TeleportEventType.TELEPORT_UPDATED
	}

	selectBestQuote(quotes: Quote[]): Quote | undefined {
		return quotes.reduce<Quote | undefined>((best, quote) => {
			if (!best || Number(quote.fees.total) < Number(best.fees.total)) {
				return quote
			}
			return best
		}, undefined)
	}
}
