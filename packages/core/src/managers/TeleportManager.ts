import { BaseManager } from '@/base/BaseManager'
import { GenericEmitter } from '@/base/GenericEmitter'
import type BridgeRegistry from '@/bridges/BridgeRegistry'
import { ActionManager } from '@/managers/ActionManager'
import { TransactionManager } from '@/managers/TransactionManager'
import BalanceService from '@/services/BalanceService'
import type { Logger } from '@/services/LoggerService'
import type SubstrateApi from '@/services/SubstrateApi'
import type { Action, Quote, SDKConfig } from '@/types/common'
import {
	type TeleportDetails,
	type TeleportEvent,
	type TeleportEventPayload,
	TeleportEventType,
	type TeleportEventTypeString,
	type TeleportParams,
	TeleportStatus,
} from '@/types/teleport'
import {
	type TransactionCallback,
	type TransactionDetails,
	TransactionEventType,
	type TransactionEventTypeString,
	TransactionStatus,
	TransactionType,
	type TransactionUnsubscribe,
} from '@/types/transactions'

export class TeleportManager extends BaseManager<
	TeleportDetails,
	TeleportStatus,
	TeleportEvent,
	TeleportEventTypeString,
	TeleportEventPayload,
	{ checked?: boolean }
> {
	private readonly transactionManager: TransactionManager
	private readonly balanceService: BalanceService
	private readonly actionManager: ActionManager

	constructor(
		teleportEventEmitter: GenericEmitter<
			TeleportEventPayload,
			TeleportEventTypeString
		>,
		private readonly bridgeRegistry: BridgeRegistry,
		config: SDKConfig,
		private readonly subApi: SubstrateApi,
		private readonly logger: Logger,
	) {
		super(teleportEventEmitter)
		this.transactionManager = new TransactionManager(
			new GenericEmitter<TransactionDetails, TransactionEventTypeString>(),
		)
		this.actionManager = new ActionManager(this.subApi, config)
		this.balanceService = new BalanceService(this.subApi, this.logger)

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
			this.logger.debug(
				`[${TeleportEventType.TELEPORT_UPDATED}] ${teleport.status}`,
			)

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
				this.isTeleportActionsFirstRun(teleport)
			) {
				this.executeTeleportActions(teleport)
			}
		})

		/**
		 * Subscribe to transaction events.
		 **/
		this.transactionManager.subscribe(
			TransactionEventType.TRANSACTION_UPDATED,
			async (transaction) => {
				this.logger.debug(
					`[${TransactionEventType.TRANSACTION_UPDATED}] ${transaction.status}`,
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
							this.emitTeleportUpdated(teleport)
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

	private isTeleportActionsFirstRun(teleport: TeleportDetails) {
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

		this.updateStatus(teleport.id, TeleportStatus.Executing, {
			checked: true,
		})
	}

	private findNextPendingTransaction(
		teleport: TeleportDetails,
	): TransactionDetails | undefined {
		const transaction = this.transactionManager
			.getItemsWhere((transaction) => transaction.teleportId === teleport.id)
			.sort((a, b) => a.order - b.order)
			.find((transaction) => transaction.status !== TransactionStatus.Finalized)

		if (!transaction) {
			return
		}

		return transaction
	}

	private executeTeleportActions(teleport: TeleportDetails) {
		const transaction = this.findNextPendingTransaction(teleport)

		if (!transaction) {
			return this.updateStatus(teleport.id, TeleportStatus.Completed)
		}

		this.executeTeleportTransaction(transaction)
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

	async createTeleport(
		params: TeleportParams,
		quote: Quote,
	): Promise<TeleportDetails> {
		const teleportId = crypto.randomUUID() as string

		const teleport: TeleportDetails = {
			id: teleportId,
			status: TeleportStatus.Pending,
			details: {
				address: params.address,
				amount: quote.total,
				asset: quote.asset,
				route: quote.route,
			},
			events: [],
			timestamp: Date.now(),
			checked: false,
		}

		this.setItem(teleportId, teleport, false)

		return teleport
	}

	initiateTeleport(
		teleport: TeleportDetails,
		params: TeleportParams,
		quote: Quote,
	) {
		this.createTelportTransactions(params, quote, teleport.id)

		this.startTeleport(teleport)
	}

	private executeTeleportTransaction(transaction: TransactionDetails) {
		const teleport = this.getItem(transaction.teleportId)

		if (!teleport) {
			return
		}

		if (transaction.status !== TransactionStatus.Unknown) {
			this.transactionManager.updateStatus(
				transaction.id,
				TransactionStatus.Unknown,
			)
		}

		const actionExecutor: Record<
			TransactionType,
			({
				transaction,
				teleport,
			}: {
				transaction: TransactionDetails
				teleport: TeleportDetails
			}) => void
		> = {
			[TransactionType.Teleport]: ({ teleport }) => {
				this.transferFunds(teleport)
			},
			[TransactionType.Action]: ({ transaction, teleport }) => {
				this.actionManager.execute(
					{
						action: transaction.details as Action,
						chain: transaction.chain,
						address: teleport.details.address,
					},
					this.transactionCallbackHandler(transaction.id),
				)
			},
		}

		actionExecutor[transaction.type]({ transaction, teleport })
	}

	retryTeleport(teleportId: string) {
		const teleport = this.getItem(teleportId)

		if (!teleport) {
			throw new Error('Teleport not found')
		}

		if (teleport.status !== TeleportStatus.Failed) {
			throw new Error('Teleport is not failed')
		}

		const transaction = this.findNextPendingTransaction(teleport)

		if (!transaction) {
			return
		}

		this.executeTeleportTransaction(transaction)
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
				amount: quote.total,
				from: quote.route.source,
				to: quote.route.target,
				address: params.address,
				asset: quote.asset,
			},
			teleportId,
			chain: source,
		})

		const actions = [] as Action[] // params.actions

		actions.forEach((action, index) => {
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
		teleport: TeleportDetails,
	): Promise<TransactionUnsubscribe> {
		const transactionId = this.getTeleportTransactionId(teleport.id)

		const bridge = this.bridgeRegistry.get(teleport.details.route.protocol)

		return await bridge.transfer(
			{
				amount: teleport.details.amount,
				from: teleport.details.route.source,
				to: teleport.details.route.target,
				address: teleport.details.address,
				asset: teleport.details.asset,
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
