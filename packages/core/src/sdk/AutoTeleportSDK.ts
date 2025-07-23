import { Initializable } from '../base/Initializable'
import BridgeRegistry from '../bridges/BridgeRegistry'
import XCMBridge from '../bridges/xcm/XCMBridge'
import { SDKConfigManager } from '../config/SDKConfigManager'
import {
	type TeleportDetails,
	type TeleportEventPayload,
	type TeleportEventType,
	type TeleportEventTypeString,
	TeleportManager,
} from '../managers/TeleportManager'
import BalanceService from '../services/BalanceService'
import SubstrateApi from '../services/SubstrateApi'
import type { SDKConfig } from '../types'
import type { Quote, TeleportParams } from '../types/bridges'
import { GenericEmitter } from '../utils/GenericEmitter'

export default class AutoTeleportSDK extends Initializable {
	private readonly config: SDKConfig
	private readonly bridgeRegistry = new BridgeRegistry()
	private teleportManager: TeleportManager | undefined
	private readonly balanceService: BalanceService
	private readonly subApi: SubstrateApi

	constructor(config: SDKConfig) {
		super()
		const combinedConfig = SDKConfigManager.getDefaultConfig(config)
		SDKConfigManager.validateConfig(combinedConfig)
		this.config = combinedConfig

		this.subApi = new SubstrateApi()
		this.balanceService = new BalanceService(this.subApi)
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
			)

			this.markInitialized()

			console.log('SDK initialized successfully')
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

	async autoteleport(params: TeleportParams): Promise<{
		quotes: Quote[]
		needed: boolean
		unsubscribe: () => void
	}> {
		const quotes = await this.getQuotes(params)

		// subscribe balance changes to update quotes
		const balanceChanges = this.subscribeBalanceChanges(params, () => {
			console.log('balance change')
		})

		return {
			quotes,
			needed: quotes.length > 0,
			unsubscribe: () => {},
		}
	}

	public async teleport(params: TeleportParams, quote: Quote): Promise<string> {
		this.ensureInitialized()

		if (!this.teleportManager) {
			throw new Error('No teleport manager found.')
		}

		const teleportId = await this.teleportManager.initiateTeleport(
			params,
			quote,
		)

		return teleportId.id
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
