import { Initializable } from '../base/Initializable'
import BridgeRegistry from '../bridges/BridgeRegistry'
import XCMBridge from '../bridges/xcm/XCMBridge'
import { SDKConfigManager } from '../config/SDKConfigManager'
import { TeleportManager } from '../managers/TeleportManager'
import type { SDKConfig } from '../types'
import type { Quote, TeleportParams } from '../types/bridges'
import { GenericEmitter } from '../utils/GenericEmitter'

export default class AutoTeleportSDK extends Initializable {
	private readonly config: SDKConfig
	private readonly bridgeRegistry = new BridgeRegistry()
	private teleportManager: TeleportManager | undefined

	constructor(config: SDKConfig) {
		super()
		const combinedConfig = SDKConfigManager.getDefaultConfig(config)
		SDKConfigManager.validateConfig(combinedConfig)
		this.config = combinedConfig
	}

	async initialize() {
		if (this.isInitialized()) {
			throw new Error('SDK already initialized')
		}

		try {
			if (this.config.bridgeProtocols?.includes('XCM')) {
				this.bridgeRegistry.register(new XCMBridge(this.config))
			}

			await Promise.all(
				this.bridgeRegistry.getAll().map((bridge) => bridge.initialize()),
			)

			this.teleportManager = new TeleportManager(
				new GenericEmitter<any, any>(),
				this.bridgeRegistry,
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

	public async getQuotes(params: TeleportParams): Promise<Quote[]> {
		this.ensureInitialized()
		this.validateTransferParams(params)

		const bridges = this.bridgeRegistry.getAll()

		const quotePromises = bridges.map((bridge) =>
			bridge.getQuote(params).catch((error) => {
				console.error(`${bridge.protocol} quote failed:`, error)
				return null
			}),
		)

		const results = await Promise.all(quotePromises)

		return results.filter((quote): quote is Quote => quote !== null)
	}

	public async teleport(params: TeleportParams): Promise<string> {
		this.ensureInitialized()

		const quotes = await this.getQuotes(params)

		if (quotes.length === 0) {
			throw new Error('No quotes available for the given parameters.')
		}

		if (!this.teleportManager) {
			throw new Error('No teleport manager found.')
		}

		const bestQuote = this.teleportManager.selectBestQuote(quotes)

		if (!bestQuote) {
			throw new Error('-Could not select the best quote.')
		}

		const bridge = this.bridgeRegistry.get(bestQuote.route.protocol)

		if (!bridge) {
			throw new Error(
				`No bridge found for protocol: ${bestQuote.route.protocol}`,
			)
		}

		const teleportId = await this.teleportManager.initiateTeleport(
			params,
			bestQuote,
		)

		return teleportId.id
	}

	private validateTransferParams(params: TeleportParams) {
		// implement validation
	}
}
