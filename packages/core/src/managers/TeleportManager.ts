import { BaseManager } from '@/base/BaseManager'
import { GenericEmitter } from '@/base/GenericEmitter'
import type BridgeRegistry from '@/bridges/BridgeRegistry'
import { TransactionManager } from '@/managers/TransactionManager'
import BalanceService from '@/services/BalanceService'
import type { Logger } from '@/services/LoggerService'
import type SubstrateApi from '@/services/SubstrateApi'
import type { Quote } from '@/types/common'
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

	private readonly statusActionMap: Partial<
		Record<TeleportStatus, (teleport: TeleportDetails) => Promise<void>>
	> = {
		[TeleportStatus.Pending]: async (teleport) => {
			const pendingTransaction = this.findNextPendingTransaction(teleport)
			if (pendingTransaction) {
				return this.executeTeleportTransaction(pendingTransaction)
			}
		},
		[TeleportStatus.Waiting]: async (teleport) => this.checkForFunds(teleport),
	}

	constructor(
		teleportEventEmitter: GenericEmitter<
			TeleportEventPayload,
			TeleportEventTypeString
		>,
		private readonly bridgeRegistry: BridgeRegistry,
		private readonly subApi: SubstrateApi,
		private readonly logger: Logger,
	) {
		super(teleportEventEmitter)
		this.transactionManager = new TransactionManager(
			new GenericEmitter<TransactionDetails, TransactionEventTypeString>(),
		)
		this.balanceService = new BalanceService(this.subApi, this.logger)

		this.registerListeners()
	}

	// --------------------------
	// Public API Methods
	// --------------------------

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

	retryTeleport(teleportId: string) {
		const teleport = this.getItem(teleportId)

		if (!teleport) {
			throw new Error('Teleport not found')
		}

		if (teleport.status !== TeleportStatus.Failed) {
			throw new Error('Only failed teleports can be retried')
		}

		this.logger.debug(`Retrying failed teleport: ${teleportId}`)

		const teleportTransactions = this.transactionManager.getItemsWhere(
			(transaction) => transaction.teleportId === teleportId,
		)

		for (const transaction of teleportTransactions) {
			if (this.transactionManager.isTransactionFailed(transaction)) {
				this.transactionManager.resetTransaction(transaction)
			}
		}

		this.updateStatus(teleport.id, TeleportStatus.Pending)

		this.processNextStep(teleport)
	}

	selectBestQuote(quotes: Quote[]): Quote | undefined {
		return quotes.reduce<Quote | undefined>((best, quote) => {
			if (!best || Number(quote.fees.total) < Number(best.fees.total)) {
				return quote
			}
			return best
		}, undefined)
	}

	// --------------------------
	// Event Handlers
	// --------------------------

	private registerListeners() {
		/**
		 * Subscribe to teleport events.
		 **/
		this.subscribe(TeleportEventType.TELEPORT_STARTED, (teleport) => {
			this.logger.debug(
				`[${TeleportEventType.TELEPORT_STARTED}] ${teleport.id}`,
			)

			this.processNextStep(teleport)
		})

		this.subscribe(TeleportEventType.TELEPORT_UPDATED, async (teleport) => {
			this.logger.debug(
				`[${TeleportEventType.TELEPORT_UPDATED}] ${teleport.status}`,
			)

			if (teleport.status === TeleportStatus.Failed) return

			if (teleport.status === TeleportStatus.Completed) {
				return this.eventEmitter.emit({
					type: TeleportEventType.TELEPORT_COMPLETED,
					payload: teleport,
				})
			}

			this.processNextStep(teleport)
		})

		/**
		 * Subscribe to transaction events.
		 **/
		this.transactionManager.subscribe(
			TransactionEventType.TRANSACTION_UPDATED,
			async (transaction) => {
				this.logger.debug(
					`[${TransactionEventType.TRANSACTION_UPDATED}] ${transaction.id} -> ${transaction.status}`,
				)

				this.handleTransactionUpdate(transaction)
			},
		)
	}

	// --------------------------
	// State Management
	// --------------------------

	private processNextStep(teleport: TeleportDetails): void {
		this.logger.debug(
			`Processing next step for teleport ${teleport.id} in status ${teleport.status}`,
		)

		this.statusActionMap[teleport.status]?.(teleport)
	}

	private calculateNextTeleportStatus(
		teleport: TeleportDetails,
		transaction: TransactionDetails,
	): TeleportStatus | null {
		if (this.transactionManager.isTransactionFailed(transaction)) {
			return TeleportStatus.Failed
		}

		if (transaction.type === TransactionType.Teleport) {
			// Pending -> Transferring
			if (
				teleport.status === TeleportStatus.Pending &&
				transaction.status !== TransactionStatus.Unknown
			) {
				return TeleportStatus.Transferring
			}

			// Transaction finalized: Transferring -> Waiting
			if (
				teleport.status === TeleportStatus.Transferring &&
				transaction.status === TransactionStatus.Finalized &&
				!this.transactionManager.isTransactionFailed(transaction)
			) {
				return TeleportStatus.Waiting
			}
		}

		return null
	}

	private handleTransactionUpdate(transaction: TransactionDetails): void {
		const teleport = this.getTeleportById(transaction.teleportId)

		const nextStatus = this.calculateNextTeleportStatus(teleport, transaction)

		if (nextStatus) {
			this.updateStatus(teleport.id, nextStatus)
		} else {
			this.emitTeleportUpdated(teleport)
		}

		if (
			transaction.status === TransactionStatus.Finalized &&
			!this.transactionManager.isTransactionFailed(transaction)
		) {
			const nextTransaction = this.findNextTransactionInSequence(
				teleport,
				transaction,
			)
			if (nextTransaction) {
				this.executeTeleportTransaction(nextTransaction)
			}
		}
	}

	private async checkForFunds(teleport: TeleportDetails) {
		await this.balanceService.waitForFunds({
			address: teleport.details.address,
			chains: [teleport.details.route.target],
			asset: teleport.details.asset,
			amount: teleport.details.amount,
		})

		this.updateStatus(teleport.id, TeleportStatus.Completed, {
			checked: true,
		})
	}

	private startTeleport(teleport: TeleportDetails) {
		this.eventEmitter.emit({
			type: TeleportEventType.TELEPORT_STARTED,
			payload: this.teleportMapper(teleport),
		})
	}

	// --------------------------
	// Transaction Management
	// --------------------------

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
	}

	private executeTeleportTransaction(transaction: TransactionDetails) {
		const teleport = this.getItem(transaction.teleportId)

		if (!teleport) {
			return
		}

		if (transaction.status !== TransactionStatus.Unknown) {
			this.transactionManager.resetTransaction(transaction)
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
		}

		actionExecutor[transaction.type]({ transaction, teleport })
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

	private findNextPendingTransaction(
		teleport: TeleportDetails,
	): TransactionDetails | undefined {
		return this.transactionManager
			.getItemsWhere((tx) => tx.teleportId === teleport.id)
			.sort((a, b) => a.order - b.order)
			.find(
				(tx) =>
					tx.status === TransactionStatus.Unknown ||
					this.transactionManager.isTransactionFailed(tx),
			)
	}

	private findNextTransactionInSequence(
		teleport: TeleportDetails,
		currentTransaction: TransactionDetails,
	): TransactionDetails | undefined {
		return this.transactionManager
			.getItemsWhere((tx) => tx.teleportId === teleport.id)
			.sort((a, b) => a.order - b.order)
			.find(
				(tx) =>
					tx.order > currentTransaction.order &&
					tx.status === TransactionStatus.Unknown,
			)
	}

	private transactionCallbackHandler(
		transactionId: string,
	): TransactionCallback {
		return ({ status, txHash, error }) => {
			this.transactionManager.updateStatus(transactionId, status, {
				txHash,
				error,
				succeeded: status === TransactionStatus.Finalized ? !error : undefined,
			})
		}
	}

	// --------------------------
	// Utility Methods
	// --------------------------

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

	private getTeleportTransactionId(teleportId: string) {
		return `${teleportId}-transaction` as const
	}

	protected getUpdateEventType(): TeleportEventTypeString {
		return TeleportEventType.TELEPORT_UPDATED
	}

	protected getEmitUpdateEventPayload(
		item: TeleportDetails,
	): TeleportEventPayload {
		return this.teleportMapper(item)
	}
}
