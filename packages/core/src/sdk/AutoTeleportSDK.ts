import { Initializable } from '../base/Initializable'
import BridgeRegistry from '../bridges/BridgeRegistry'
import XCMBridge from '../bridges/xcm/XCMBridge'
import { SDKConfigManager } from '../config/SDKConfigManager'
import { TeleportManager } from '../managers/TeleportManager'
import BalanceService from '../services/BalanceService'
import { Logger } from '../services/LoggerService'
import SubstrateApi from '../services/SubstrateApi'
import type { Quote, SDKConfig } from '../types/common'
import type { AutoteleportResponse } from '../types/sdk'
import type {
	TeleportEventPayload,
	TeleportEventType,
	TeleportEventTypeString,
	TeleportParams,
} from '../types/teleport'
import { GenericEmitter } from '../utils/GenericEmitter'
import { convertToBigInt } from '../utils/number'

export default class AutoTeleportSDK extends Initializable {
	private readonly config: SDKConfig
	private readonly bridgeRegistry = new BridgeRegistry()
	private teleportManager: TeleportManager | undefined
	private readonly balanceService: BalanceService
	private readonly subApi: SubstrateApi
	private readonly logger: Logger

	constructor(config: SDKConfig) {
		super()
		const combinedConfig = SDKConfigManager.getDefaultConfig(config)
		SDKConfigManager.validateConfig(combinedConfig)
		this.config = combinedConfig

		this.subApi = new SubstrateApi()
		this.balanceService = new BalanceService(this.subApi)
		this.logger = new Logger({
			minLevel: this.config.logLevel,
		})
	}

	async initialize() {
		if (this.isInitialized()) {
			throw new Error('SDK already initialized')
		}

		try {
			if (this.config.bridgeProtocols?.includes('XCM')) {
				this.bridgeRegistry.register(
					new XCMBridge(this.config, this.balanceService, this.subApi),
				)
			}

			await Promise.all(
				this.bridgeRegistry.getAll().map((bridge) => bridge.initialize()),
			)

			this.teleportManager = new TeleportManager(
				new GenericEmitter<TeleportEventPayload, TeleportEventTypeString>(),
				this.bridgeRegistry,
				this.config,
				this.subApi,
				this.logger
			)

			this.markInitialized()

			this.logger.info('SDK initialized successfully')
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new Error(`Failed to initialize SDK: ${error.message}`)
			}
			throw new Error('Failed to initialize SDK: Unknown error')
		}
	}

	on(
		event: TeleportEventType | `${TeleportEventType}`,
		callback: (item: TeleportEventPayload) => void,
	): void {
		this.teleportManager?.subscribe(event, callback)
	}

	private async getQuotes(params: TeleportParams): Promise<Quote[]> {
		this.ensureInitialized()
		this.validateTeleportParams(params)

		const bridges = this.bridgeRegistry.getAll()

		const quotePromises = bridges.map((bridge) =>
			bridge.getQuote(params).catch(() => null),
		)

		const results = await Promise.all(quotePromises)

		return results.filter((quote): quote is Quote => quote !== null)
	}

	private subscribeBalanceChanges(
		params: TeleportParams,
		callback: () => void,
	) {
		return this.balanceService.subscribeBalances(
			{
				address: params.address,
				asset: params.asset,
				chains: this.config?.chains || [],
			},
			callback,
		)
	}

	private async calculateTeleport(
		params: TeleportParams,
	): Promise<AutoteleportResponse> {
		const hasEnoughBalance = await this.balanceService.hasEnoughBalance(params)

		if (hasEnoughBalance) {
			return {
				quotes: [],
				needed: false,
				available: false,
				noFundsAtAll: false,
			}
		}

		const quotes = await this.getQuotes(params)

		return {
			quotes,
			needed: !hasEnoughBalance,
			available: quotes.length > 0,
			noFundsAtAll: !hasEnoughBalance && quotes.length === 0,
		}
	}

	async autoteleport(
		p: TeleportParams<string>,
	): Promise<AutoteleportResponse & { unsubscribe: () => void }> {
		const params = convertToBigInt(p, ['amount'])

		const response = await this.calculateTeleport(params)

		this.subscribeBalanceChanges(params, async () => {
			console.log('balance change', await this.calculateTeleport(params))
		})

		return {
			...response,
			unsubscribe: () => {},
		}
	}

	public async teleport(
		params: TeleportParams<string>,
		quote: Quote,
	): Promise<{ id: string; retry: () => void }> {
		this.ensureInitialized()

		if (!this.teleportManager) {
			throw new Error('No teleport manager found.')
		}

		const teleportId = await this.teleportManager.initiateTeleport(
			convertToBigInt(params, ['amount']),
			quote,
		)

		return {
			id: teleportId.id,
			retry: () => {
				this.teleportManager?.retryTeleport(teleportId.id)
			},
		}
	}

	private validateTeleportParams(params: TeleportParams) {
		const validActions = params.actions.every((action) => {
			return Object.hasOwn(action, 'section') && Object.hasOwn(action, 'method')
		})

		const valid =
			validActions &&
			Boolean(params.address) &&
			Boolean(params.asset) &&
			Boolean(params.amount) &&
			Boolean(params.chain)

		if (!valid) {
			throw new Error('Invalid actions')
		}
	}
}
