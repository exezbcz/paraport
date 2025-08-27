import {
	ASSET_CHAINS_MAP,
	type Asset,
	CHAINS,
	CHAIN_NAMES,
	type Chain,
	type ChainProperties,
	ENDPOINT_MAP,
	existentialDeposit,
	teleportExistentialDeposit,
} from '@paraport/static'

export const edOf = (chain: Chain): bigint => {
	return BigInt(existentialDeposit[chain])
}

export const teleportEdOf = (chain: Chain): bigint => {
	return BigInt(teleportExistentialDeposit[chain])
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

export const getChainsOfAsset = (asset: Asset): Chain[] => {
	return ASSET_CHAINS_MAP[asset] || []
}

export const endpointOf = (chain: Chain): string => {
	return ENDPOINT_MAP[chain]
}

export const getChainName = (chain: Chain): string => {
	return CHAIN_NAMES[chain]
}
