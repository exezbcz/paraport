import { Asset, Chain, type ChainPrefix } from '../types'

export const ASSET_CHAINS_MAP: Partial<Record<Asset, Chain[]>> = {
	[Asset.DOT]: [Chain.POLKADOT, Chain.ASSETHUBPOLKADOT],
	[Asset.KSM]: [Chain.KUSAMA, Chain.ASSETHUBKUSAMA],
}

export const CHAIN_PREFIX_TO_CHAIN_MAP: Partial<Record<ChainPrefix, Chain>> = {
	dot: Chain.POLKADOT,
	ahp: Chain.ASSETHUBPOLKADOT,
	ksm: Chain.KUSAMA,
	ahk: Chain.ASSETHUBKUSAMA,
}

export const CHAIN_TO_CHAIN_PREFIX_MAP: Partial<Record<Chain, ChainPrefix>> = {
	[Chain.POLKADOT]: 'dot',
	[Chain.ASSETHUBPOLKADOT]: 'ahp',
	[Chain.KUSAMA]: 'ksm',
	[Chain.ASSETHUBKUSAMA]: 'ahk',
}
