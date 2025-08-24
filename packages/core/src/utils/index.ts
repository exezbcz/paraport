import { formatAddress } from '@/utils/account'
import { transferableBalanceOf } from '@/utils/balance'
import { edOf, teleportEdOf } from '@/utils/chains'
import {
	ASSET_CHAINS_MAP,
	type Asset,
	CHAINS,
	type Chain,
	type ChainProperties,
	ENDPOINT_MAP,
} from '@paraport/static'

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

export { formatAddress, edOf, teleportEdOf, transferableBalanceOf }
