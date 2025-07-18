import { type BaseDetails, BaseManager } from '../base/BaseManager'
import type BridgeRegistry from '../bridges/BridgeRegistry'
import type { Asset } from '../types'
import type {
	Quote,
	Route,
	TeleportParams,
	TransactionDetails,
} from '../types/bridges'
import { GenericEmitter } from '../utils/GenericEmitter'
import {
	TransactionEventType,
	type TransactionEventTypeString,
	TransactionManager,
} from './TransactionManager'

type TeleportEvent = any

interface TeleportDetails extends BaseDetails<TeleportStatus, TeleportEvent> {
	id: string
	details: {
		address: string
		amount: string
		asset: Asset
		route: Route
	}
	events: TeleportEvent[]
	timestamp: number
}

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

		this.registerListeners()
	}

	private registerListeners() {
		this.transactionManager.subscribe(
			TransactionEventType.TRANSACTION_UPDATED,
			(item) => {
				console.log('TransactionManager', item)
			},
		)
	}

	async initiateTeleport(
		params: TeleportParams,
		quote: Quote,
	): Promise<TeleportDetails> {
		const teleportId = crypto.randomUUID() as string

		const teleport: TeleportDetails = {
			id: teleportId,
			status: TeleportStatus.PENDING,
			details: {
				address: params.address,
				amount: params.amount,
				asset: params.asset,
				route: quote.route,
			},
			events: [],
			timestamp: Date.now(),
		}

		this.setItem(teleportId, teleport, false)

		this.createTelportTransactions(params, quote, teleportId)

		try {
			await this.transferFunds(teleport)
		} catch (error: any) {
			console.error('Error during transfer:', error)
		}

		return teleport
	}

	private createTelportTransactions(
		params: TeleportParams,
		quote: Quote,
		teleportId: string,
	) {
		const source = quote.route.source

		this.transactionManager.createTransaction({
			id: this.getTeleportTransactionId(teleportId),
			type: 'Teleport',
			details: {
				amount: params.amount,
				from: quote.route.source,
				to: quote.route.target,
				address: params.address,
				asset: params.asset,
			},
			teleportId,
			chain: source,
		})

		params.actions.forEach((action, index) => {
			this.transactionManager.createTransaction({
				type: 'Action',
				id: this.getActionTransactionId(teleportId, index),
				details: action,
				teleportId,
				chain: source,
			})
		})
	}

	private getTeleportTransactionId(teleportId: string) {
		return `${teleportId}-transaction` as const
	}

	private getActionTransactionId(teleportId: string, index: number) {
		return `${teleportId}-transaction-${index.toString()}` as const
	}

	private async transferFunds(
		teleportDetails: TeleportDetails,
	): Promise<() => void> {
		const transactionId = this.getTeleportTransactionId(teleportDetails.id)

		const bridge = this.bridgeRegistry.get(
			teleportDetails.details.route.protocol,
		)

		return await bridge.transfer(
			{
				amount: teleportDetails.details.amount,
				from: teleportDetails.details.route.source,
				to: teleportDetails.details.route.target,
				address: teleportDetails.details.address,
				asset: teleportDetails.details.asset,
			},
			({ status }) => {
				this.transactionManager.updateStatus(transactionId, status)
			},
		)
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
