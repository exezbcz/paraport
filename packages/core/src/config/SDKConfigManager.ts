import ConfigValidationError from '@/errors/ConfigError'
import type { SDKConfig } from '@/types/common'
import { LogLevel } from '@/types/sdk'
import { Chain } from '@paraport/static'

export class SDKConfigManager {
	public static validateConfig(config: SDKConfig) {
		if (!config.bridgeProtocols?.length) {
			throw new ConfigValidationError(
				'At least one bridge protocol must be specified',
			)
		}
	}

	public static getDefaultConfig(config: SDKConfig<false>): SDKConfig {
		return {
			...config,
			bridgeProtocols: ['XCM'],
			logLevel: config.logLevel ?? LogLevel.INFO,
			chains: [
				Chain.Polkadot,
				Chain.AssetHubPolkadot,
				Chain.Kusama,
				Chain.AssetHubKusama,
			],
		}
	}
}
