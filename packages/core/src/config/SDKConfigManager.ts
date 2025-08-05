import ConfigValidationError from '@/errors/ConfigError'
import { Chain, type SDKConfig } from '@/types/common'
import { LogLevel } from '@/types/sdk'

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
			logLevel: LogLevel.ERROR,
			chains: [
				Chain.POLKADOT,
				Chain.ASSETHUBPOLKADOT,
				Chain.KUSAMA,
				Chain.ASSETHUBKUSAMA,
			],
		}
	}
}
