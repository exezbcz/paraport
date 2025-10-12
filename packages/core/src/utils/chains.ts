import {
	type Asset,
	CHAINS,
	CHAIN_NAMES,
	type Chain,
	type ChainProperties,
	Chains,
	existentialDeposit,
} from '@paraport/static'
import { SUBSTRATE_CHAINS } from '@paraspell/sdk'
import { isAssetSupported } from './assets'

export const edOf = (chain: Chain): bigint => {
	return BigInt(existentialDeposit[chain])
}

export const chainPropListOf = (chain: Chain): ChainProperties => {
	return CHAINS[chain]
}

export const ss58Of = (chain: Chain): number => {
	return chainPropListOf(chain).ss58Format
}

export const decimalsOf = (chain: Chain): number => {
	return chainPropListOf(chain).tokenDecimals
}

//

/**
 * Lists chains where telport will interact and where a given asset is available.
 * @param chain - Chain identifier
 * @param asset - Asset symbol
 * @returns Array of chains
 */
export const getRouteChains = (chain: Chain, asset: Asset): Chain[] => {
	const otherChains = SUBSTRATE_CHAINS.filter((subChain) => {
		if (chain === subChain) return false

		return isAssetSupported(chain, subChain as Chain, asset)
	})

	const allowed = new Set(Object.values(Chains))

	return [chain, ...otherChains].filter((c) =>
		allowed.has(c as Chain),
	) as Chain[]
}

export const getChainName = (chain: Chain): string => {
	return CHAIN_NAMES[chain]
}

export const blockExplorerOf = (chain: Chain): string => {
	return chainPropListOf(chain).blockExplorer
}
