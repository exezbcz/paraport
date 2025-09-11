import { type Asset, Assets, type ChainProperties, type Config } from "./types";
import { type Chain, Chains } from "./types";

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
	[Chains.Polkadot]: toChainProperty(
		0,
		10,
		Assets.DOT,
		"https://polkadot.subscan.io/",
	),
	[Chains.AssetHubPolkadot]: toChainProperty(
		0,
		10,
		Assets.DOT,
		"https://assethub-polkadot.subscan.io/",
	),
	[Chains.Kusama]: toChainProperty(
		2,
		12,
		Assets.KSM,
		"https://kusama.subscan.io/",
	),
	[Chains.AssetHubKusama]: toChainProperty(
		2,
		12,
		Assets.KSM,
		"https://assethub-kusama.subscan.io/",
	),
	[Chains.Hydration]: toChainProperty(
		2,
		12,
		Assets.HDX,
		"https://hydradx.subscan.io",
	),
};

// DEV: note that ED is different from the on-chain ED to prevent weird edge cases of XCM
export const teleportExistentialDeposit: Record<Chain, number> = {
	[Chains.Polkadot]: 15000000000,
	[Chains.AssetHubPolkadot]: 5000000000,
	[Chains.Kusama]: 666666666,
	[Chains.AssetHubKusama]: 666666666,
	[Chains.Hydration]: 666666666,
};

export const existentialDeposit: Record<Chain, number> = {
	[Chains.Polkadot]: 1e10,
	[Chains.AssetHubPolkadot]: 1e8,
	[Chains.Kusama]: 333333333,
	[Chains.AssetHubKusama]: 333333333,
	[Chains.Hydration]: 333333333,
};

export const ASSET_CHAINS_MAP: Partial<Record<Asset, Chain[]>> = {
	[Assets.DOT]: [Chains.Polkadot, Chains.AssetHubPolkadot, Chains.Hydration],
	[Assets.KSM]: [Chains.Kusama, Chains.AssetHubKusama],
};
