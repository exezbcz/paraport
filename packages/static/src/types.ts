export enum Chain {
	Polkadot = "Polkadot",
	AssetHubKusama = "AssetHubKusama",
	Kusama = "Kusama",
	AssetHubPolkadot = "AssetHubPolkadot",
	Hydration = "Hydration",
}

export enum Asset {
	DOT = "DOT",
	KSM = "KSM",
	HDX = "HDX",
}

export type Prefix = "dot" | "ksm" | "ahk" | "ahp";

export type Config<T = boolean> = Record<Chain, T>;

export type ChainProperties = {
	ss58Format: number;
	tokenDecimals: number;
	tokenSymbol: string;
	blockExplorer: string;
	genesisHash?: string;
};
