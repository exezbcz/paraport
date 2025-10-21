import {
	type Asset,
	CHAINS,
	CHAIN_NAMES,
	type Chain,
	type ChainProperties,
	Chains,
} from '@paraport/static'
import { SUBSTRATE_CHAINS } from '@paraspell/sdk'
import { isAssetSupported } from './assets'

/**
 * Temporary blocklist for problematic routes.
 *
 * Keys are origin chains; values are readonly lists of destinations that are
 * disabled for XCM transfers from that origin.
 *
 * @remarks This list is temporary and subject to change.
 */
const DISABLED_ROUTES: Readonly<Partial<Record<Chain, readonly Chain[]>>> = {
	[Chains.AssetHubKusama]: [Chains.AssetHubPolkadot],
	[Chains.AssetHubPolkadot]: [Chains.AssetHubKusama],
} as const

/**
 * Checks whether an origin → destination XCM route is disabled.
 *
 * @param origin Origin chain.
 * @param destination Destination chain.
 * @returns True when the pair is blocklisted; otherwise false.
 */
export const isRouteDisabled = (origin: Chain, destination: Chain): boolean => {
	const list = DISABLED_ROUTES[origin]
	return Array.isArray(list) && list.includes(destination)
}

/**
 * Returns static chain properties (ss58, decimals, explorer, etc.).
 * @param chain - Chain identifier
 * @returns Chain properties
 */
export const chainPropListOf = (chain: Chain): ChainProperties => {
	return CHAINS[chain]
}

/**
 * Gets the SS58 address format for a chain.
 * @param chain - Chain identifier
 * @returns ss58 format number
 */
export const ss58Of = (chain: Chain): number => {
	return chainPropListOf(chain).ss58Format
}

/**
 * Gets token decimals for a chain.
 * @param chain - Chain identifier
 * @returns Number of decimals
 */
export const decimalsOf = (chain: Chain): number => {
	return chainPropListOf(chain).tokenDecimals
}

/**
 * Lists chains where teleport will interact and where a given asset is available.
 *
 * Returns the destination `chain` and all origin chains that support the asset
 * and are not blocklisted by {@link isRouteDisabled}.
 *
 * @param chain Destination chain.
 * @param asset Asset symbol.
 * @returns Array of chains including the destination and eligible origins.
 */
export const getRouteChains = (chain: Chain, asset: Asset): Chain[] => {
	const otherChains = SUBSTRATE_CHAINS.filter((subChain) => {
		if (chain === subChain) return false

		return (
			isAssetSupported(chain, subChain as Chain, asset) &&
			!isRouteDisabled(subChain as Chain, chain)
		)
	})

	const allowed = new Set(Object.values(Chains))

	return [chain, ...otherChains].filter((c) =>
		allowed.has(c as Chain),
	) as Chain[]
}

/**
 * Gets a human-readable chain name.
 * @param chain - Chain identifier
 * @returns Chain name
 */
export const getChainName = (chain: Chain): string => {
	return CHAIN_NAMES[chain]
}

/**
 * Returns the block explorer URL for a chain.
 * @param chain - Chain identifier
 * @returns Explorer base URL
 */
export const blockExplorerOf = (chain: Chain): string => {
	return chainPropListOf(chain).blockExplorer
}
