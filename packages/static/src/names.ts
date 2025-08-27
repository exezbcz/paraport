import { Chain } from "./types";

export const CHAIN_NAMES: Record<Chain, string> = {
	[Chain.Polkadot]: "Polkadot",
	[Chain.AssetHubPolkadot]: "PolkadotHub",
	[Chain.Kusama]: "Kusama",
	[Chain.AssetHubKusama]: "KusamaHub",
	[Chain.Hydration]: "Hydration",
};
