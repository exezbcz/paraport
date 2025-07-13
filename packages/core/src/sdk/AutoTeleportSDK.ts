import { Initializable } from '../base/Initializable'
import BridgeRegistry from '../bridges/BridgeRegistry'
import XCMBridge from '../bridges/xcm/XCMBridge'
import ConfigValidationError from '../errors/ConfigError'
import type { SDKConfig } from '../types'
import type { Quote, TransferParams } from '../types/bridges'

export default class AutoTeleportSDK extends Initializable {
	private readonly config: SDKConfig
	private readonly bridgeRegistry = new BridgeRegistry()

	constructor(config: SDKConfig) {
		super()
		const combinedConfig = this.getDefaultConfig(config)
		this.validateConfig(combinedConfig)
		this.config = combinedConfig
	}

	private getDefaultConfig(config: SDKConfig): SDKConfig {
		return {
			...config,
			bridgeProtocols: ['XCM'],
		}
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

			this.markInitialized()

			console.log('SDK initialized successfully')
		} catch (error: unknown) {
			if (error instanceof Error) {
				throw new Error(`Failed to initialize SDK: ${error.message}`)
			}
			throw new Error('Failed to initialize SDK: Unknown error')
		}
	}

	public async validateConfig(config: SDKConfig): Promise<void> {
		if (!config.bridgeProtocols?.length) {
			throw new ConfigValidationError(
				'At least one bridge protocol must be specified',
			)
		}
	}

	public async getQuotes(params: TransferParams): Promise<Quote[]> {
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

	private validateTransferParams(params: TransferParams) {
		// implement validation
	}
}
