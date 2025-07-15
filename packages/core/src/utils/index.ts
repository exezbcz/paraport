import { CHAINS } from '@kodadot1/static'
import { formatAddress } from './account'
import { transferableBalanceOf } from './balance'
import { edOf, teleportEdOf } from './chains'

import type { ChainProperties } from '@kodadot1/static'
import type { Asset, Chain, ChainPrefix } from '../types'
import { ASSET_CHAINS_MAP, CHAIN_TO_CHAIN_PREFIX_MAP } from './constants'

export const chainPropListOf = (chain: Chain): ChainProperties => {
	return CHAINS[chainPrefixOf(chain)]
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

export const chainPrefixOf = (chain: Chain): ChainPrefix => {
	return CHAIN_TO_CHAIN_PREFIX_MAP[chain] as ChainPrefix
}

export { formatAddress, edOf, teleportEdOf, transferableBalanceOf }
