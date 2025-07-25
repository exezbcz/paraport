import { BaseManager } from '../base/BaseManager'
import type BridgeRegistry from '../bridges/BridgeRegistry'
import BalanceService from '../services/BalanceService'
import type SubstrateApi from '../services/SubstrateApi'
import type { Action, Quote, SDKConfig } from '../types'
import {
	type TeleportDetails,
	type TeleportEventPayload,
	TeleportEventType,
	type TeleportEventTypeString,
	type TeleportParams,
	TeleportStatus,
} from '../types/teleport'
import {
	type TransactionCallback,
	type TransactionDetails,
	TransactionEventType,
	type TransactionEventTypeString,
	TransactionStatus,
	TransactionType,
	type TransactionUnsubscribe,
} from '../types/transactions'
import { GenericEmitter } from '../utils/GenericEmitter'
import { ActionManager } from './ActionManager'
import { TransactionManager } from './TransactionManager'

export class TeleportManager extends BaseManager<
	TeleportDetails,
	TeleportStatus,
	any,
	TeleportEventTypeString,
	TeleportEventPayload
> {
	private readonly transactionManager: TransactionManager
	private readonly bridgeRegistry: BridgeRegistry
	private readonly subApi: SubstrateApi
	private readonly balanceService: BalanceService
	private readonly actionManager: ActionManager

	constructor(
		teleportEventEmitter: GenericEmitter<
			TeleportEventPayload,
			TeleportEventTypeString
		>,
		bridgeRegistry: BridgeRegistry,
		config: SDKConfig,
		subApi: SubstrateApi,
	) {
		super(teleportEventEmitter)
		this.transactionManager = new TransactionManager(
			new GenericEmitter<TransactionDetails, TransactionEventTypeString>(),
		)
		this.bridgeRegistry = bridgeRegistry
		this.subApi = subApi
		this.balanceService = new BalanceService(this.subApi)
		this.actionManager = new ActionManager(this.subApi, config)

		this.registerListeners()
	}

	private registerListeners() {
		/**
		 * Subscribe to teleport events.
		 **/
		this.subscribe(TeleportEventType.TELEPORT_STARTED, (payload) => {
			const teleport = this.getItem(payload.id)

			teleport && this.transferFunds(teleport)
		})

		this.subscribe(TeleportEventType.TELEPORT_UPDATED, async (teleport) => {
			console.log(`[${TeleportEventType.TELEPORT_UPDATED}]`, teleport.status)

			if (teleport.status === TeleportStatus.Completed) {
				return this.eventEmitter.emit({
					type: TeleportEventType.TELEPORT_COMPLETED,
					payload: teleport,
				})
			}

			if (teleport.status === TeleportStatus.Waiting) {
				await this.waitForFunds(teleport)
			} else if (
				teleport.status === TeleportStatus.Executing &&
				this.areIsTeleportActionsFirstRun(teleport)
			) {
				await this.executeTeleportActions(teleport)
			}
		})

		/**
		 * Subscribe to transaction events.
		 **/
		this.transactionManager.subscribe(
			TransactionEventType.TRANSACTION_UPDATED,
			async (transaction) => {
				console.log(
					`[${TransactionEventType.TRANSACTION_UPDATED}]`,
					transaction.status,
				)

				const teleport = this.getTeleportById(transaction.teleportId)

				if (transaction.status === TransactionStatus.Cancelled) {
					return this.updateStatus(teleport.id, TeleportStatus.Failed)
				}

				const transactionTypeHandler: Record<
					TransactionType,
					(transactino: TransactionDetails) => void
				> = {
					[TransactionType.Teleport]: (transaction) => {
						if (teleport.status === TeleportStatus.Pending) {
							this.updateStatus(teleport.id, TeleportStatus.Transferring)
						} else if (transaction.status === TransactionStatus.Finalized) {
							this.updateStatus(teleport.id, TeleportStatus.Waiting)
						} else {
							this.emitTeleportUpdated(teleport)
						}
					},
					[TransactionType.Action]: (transaction) => {
						if (transaction.status === TransactionStatus.Finalized) {
							this.executeTeleportActions(teleport)
						} else {
							this.emitTeleportUpdated(teleport)
						}
					},
				}

				transactionTypeHandler[transaction.type](transaction)
			},
		)
	}

	private areIsTeleportActionsFirstRun(teleport: TeleportDetails) {
		return this.transactionManager
			.getTelportTransactions(teleport.id, {
				type: TransactionType.Action,
			})
			.every((transaction) => transaction.status === TransactionStatus.Unknown)
	}

	private teleportMapper(teleport: TeleportDetails): TeleportEventPayload {
		return {
			...teleport,
			transactions: this.transactionManager.getTelportTransactions(teleport.id),
		}
	}

	private emitTeleportUpdated(teleport: TeleportDetails) {
		this.emitUpdate(this.teleportMapper(teleport))
	}

	private getTeleportById(teleportId: string) {
		const teleport = this.getItem(teleportId)

		if (!teleport) {
			throw new Error(`Teleport with id ${teleportId} not found.`)
		}

		return teleport
	}

	private async waitForFunds(teleport: TeleportDetails) {
		await this.balanceService.waitForFunds({
			address: teleport.details.address,
			chains: [teleport.details.route.target],
			asset: teleport.details.asset,
			amount: teleport.details.amount,
		})

		this.updateStatus(teleport.id, TeleportStatus.Executing)
	}

	private async findNextPendingTransaction(
		teleport: TeleportDetails,
	): Promise<TransactionDetails | undefined> {
		const transaction = this.transactionManager
			.getItemsWhere((transaction) => transaction.teleportId === teleport.id)
			.sort((a, b) => a.order - b.order)
			.find((transaction) => transaction.status !== TransactionStatus.Finalized)

		if (!transaction) {
			return
		}

		return transaction
	}

	private async executeTeleportActions(teleport: TeleportDetails) {
		const transaction = await this.findNextPendingTransaction(teleport)

		if (!transaction) {
			return this.updateStatus(teleport.id, TeleportStatus.Completed)
		}

		if (transaction.type === TransactionType.Action) {
			this.actionManager.execute(
				{
					action: transaction.details as Action,
					chain: transaction.chain,
					address: teleport.details.address,
				},
				this.transactionCallbackHandler(transaction.id),
			)
		}
	}

	private transactionCallbackHandler(
		transactionId: string,
	): TransactionCallback {
		return ({ status, txHash, error }) => {
			this.transactionManager.updateStatus(transactionId, status, {
				txHash,
				error,
			})
		}
	}

	async initiateTeleport(
		params: TeleportParams,
		quote: Quote,
	): Promise<TeleportDetails> {
		const teleportId = crypto.randomUUID() as string

		const teleport: TeleportDetails = {
			id: teleportId,
			status: TeleportStatus.Pending,
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

		this.startTeleport(teleport)

		return teleport
	}

	async startTeleport(teleport: TeleportDetails) {
		this.eventEmitter.emit({
			type: TeleportEventType.TELEPORT_STARTED,
			payload: this.teleportMapper(teleport),
		})
	}

	private createTelportTransactions(
		params: TeleportParams,
		quote: Quote,
		teleportId: string,
	) {
		const source = quote.route.source

		this.transactionManager.createTransaction({
			id: this.getTeleportTransactionId(teleportId),
			type: TransactionType.Teleport,
			order: 0,
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
				id: this.getActionTransactionId(teleportId, index),
				type: TransactionType.Action,
				order: index + 1,
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
	): Promise<TransactionUnsubscribe> {
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
			this.transactionCallbackHandler(transactionId),
		)
	}

	// Override updateStatus to also update the corresponding transaction
	// updateStatus(id: string, status: TeleportStatus, error?: string): void {
	//    super.updateStatus(id, status, error);
	// }

	protected getUpdateEventType(): TeleportEventTypeString {
		return TeleportEventType.TELEPORT_UPDATED
	}

	protected getEmitUpdateEventPayload(
		item: TeleportDetails,
	): TeleportEventPayload {
		return this.teleportMapper(item)
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
