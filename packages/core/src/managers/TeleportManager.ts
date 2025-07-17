import { BaseManager } from '../base/BaseManager'
import type BridgeRegistry from '../bridges/BridgeRegistry'
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
	private readonly bridgeRegistry: BridgeRegistry

	constructor(
		teleportEventEmitter: GenericEmitter<
			TeleportDetails,
			TeleportEventTypeString
		>,
		bridgeRegistry: BridgeRegistry,
	) {
		super(teleportEventEmitter)
		this.transactionManager = new TransactionManager(
			new GenericEmitter<TransactionDetails, TransactionEventTypeString>(),
		)
		this.bridgeRegistry = bridgeRegistry
	}

	async initiateTeleport(
		params: TeleportParams,
		quote: Quote,
	): Promise<TeleportDetails> {
		const id = crypto.randomUUID() as string

		const teleport: TeleportDetails = {
			id,
			status: TeleportStatus.PENDING,
			params,
			quote,
			events: [],
			timestamp: Date.now(),
		}

		this.setItem(id, teleport, false)

		// track brige transaction

		params.actions.forEach((action) => {
			this.transactionManager.trackTransaction({
				action,
				telportId: id,
				chain: params.sourceChain,
			})
		})

		try {
			const txHash = await this.transferFunds(params, quote)

			// teleport.transactionHash = txHash

			// this.updateStatus(id, TeleportStatus.PROCESSING)
		} catch (error: any) {
			console.error('Error during transfer:', error)
			// this.updateStatus(id, TeleportStatus.FAILED, error.message)
		}

		return teleport
	}

	private async transferFunds(
		params: TeleportParams,
		quote: Quote,
	): Promise<string> {
		const bridge = this.bridgeRegistry.get(quote.route.protocol)

		if (!bridge) {
			throw new Error(`No bridge found for protocol: ${quote.route.protocol}`)
		}

		// TODO: use only quote params
		return await bridge.transfer({
			amount: params.amount,
			from: quote.route.source,
			to: quote.route.target,
			address: params.address,
			asset: params.asset,
		})
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
