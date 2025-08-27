import { Asset, type ChainProperties, type Config } from "./types";
import { Chain } from "./types";

export const toChainProperty = (
	ss58Format: number,
	tokenDecimals: number,
	tokenSymbol: Asset,
	blockExplorer: string,
): ChainProperties => {
	return {
		ss58Format,
		tokenDecimals,
		tokenSymbol,
		blockExplorer,
	};
};

export const CHAINS: Config<ChainProperties> = {
	[Chain.Polkadot]: toChainProperty(
		0,
		10,
		Asset.DOT,
		"https://polkadot.subscan.io/",
	),
	[Chain.AssetHubPolkadot]: toChainProperty(
		0,
		10,
		Asset.DOT,
		"https://assethub-polkadot.subscan.io/",
	),
	[Chain.Kusama]: toChainProperty(
		2,
		12,
		Asset.KSM,
		"https://kusama.subscan.io/",
	),
	[Chain.AssetHubKusama]: toChainProperty(
		2,
		12,
		Asset.KSM,
		"https://assethub-kusama.subscan.io/",
	),
	[Chain.Hydration]: toChainProperty(
		2,
		12,
		Asset.HDX,
		"https://hydradx.subscan.io",
	),
};

// DEV: note that ED is different from the on-chain ED to prevent weird edge cases of XCM
export const teleportExistentialDeposit: Record<Chain, number> = {
	[Chain.Polkadot]: 15000000000,
	[Chain.AssetHubPolkadot]: 5000000000,
	[Chain.Kusama]: 666666666,
	[Chain.AssetHubKusama]: 666666666,
	[Chain.Hydration]: 666666666,
};

export const existentialDeposit: Record<Chain, number> = {
	[Chain.Polkadot]: 1e10,
	[Chain.AssetHubPolkadot]: 1e8,
	[Chain.Kusama]: 333333333,
	[Chain.AssetHubKusama]: 333333333,
	[Chain.Hydration]: 333333333,
};

export const ASSET_CHAINS_MAP: Partial<Record<Asset, Chain[]>> = {
	[Asset.DOT]: [Chain.Polkadot, Chain.AssetHubPolkadot, Chain.Hydration],
	[Asset.KSM]: [Chain.Kusama, Chain.AssetHubKusama, Chain.Hydration],
};
