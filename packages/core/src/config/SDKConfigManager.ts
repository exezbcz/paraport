import ConfigValidationError from '@/errors/ConfigError'
import type { SDKConfig } from '@/types/common'
import { LogLevels } from '@/types/sdk'
import { Chains } from '@paraport/static'

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
			logLevel: config.logLevel ?? LogLevels.INFO,
			chains: [
				Chains.Polkadot,
				Chains.AssetHubPolkadot,
				Chains.Kusama,
				Chains.AssetHubKusama,
				Chains.Hydration,
			],
		}
	}
}
