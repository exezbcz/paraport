import type { Chain, Config } from "./types";
import { Chains } from "./types";

import endpointsFile from "../endpoints.json";

const endpoints = endpointsFile as Record<
	Chain,
	{
		endpoint: ENDPOINT_URL | undefined;
		providers: ENDPOINT_URL[];
		responseTime: number;
		fallback: boolean;
	}
>;

type WS_URL = `wss://${string}` | `ws://${string}`;
type HTTP_URL = `https://${string}` | `http://${string}`;

type ENDPOINT_URL = WS_URL | HTTP_URL;

const KUSAMA_ENDPOINTS: WS_URL[] = [
	"wss://rpc.ibp.network/kusama",
	"wss://rpc.dotters.network/kusama",
	"wss://1rpc.io/ksm",
	"wss://kusama-rpc.dwellir.com",
];

const POLKADOT_ENDPOINTS: WS_URL[] = [
	"wss://rpc.dotters.network/polkadot",
	"wss://polkadot.public.curie.radiumblock.co/ws",
	"wss://rpc.ibp.network/polkadot",
	"wss://1rpc.io/dot",
	"wss://polkadot-rpc.dwellir.com",
];

// Someone from HydraDX team told me that Polkadot API takes Array of endpoints
export const ALTERNATIVE_ENDPOINT_MAP: Config<ENDPOINT_URL[]> = {
	[Chains.Polkadot]: POLKADOT_ENDPOINTS,
	[Chains.AssetHubPolkadot]: endpoints[Chains.AssetHubPolkadot].providers,
	[Chains.Kusama]: KUSAMA_ENDPOINTS,
	[Chains.AssetHubKusama]: endpoints[Chains.AssetHubKusama].providers,
	[Chains.Hydration]: endpoints[Chains.Hydration].providers,
};

export const ENDPOINT_MAP: Config<ENDPOINT_URL> = {
	[Chains.Polkadot]: POLKADOT_ENDPOINTS[0],
	[Chains.AssetHubPolkadot]:
		endpoints[Chains.AssetHubPolkadot].endpoint ||
		ALTERNATIVE_ENDPOINT_MAP[Chains.AssetHubPolkadot][0],
	[Chains.Kusama]: KUSAMA_ENDPOINTS[0],
	[Chains.AssetHubKusama]:
		endpoints[Chains.AssetHubKusama].endpoint ||
		ALTERNATIVE_ENDPOINT_MAP[Chains.AssetHubKusama][0],
	[Chains.Hydration]:
		endpoints[Chains.Hydration].endpoint ||
		ALTERNATIVE_ENDPOINT_MAP[Chains.Hydration][0],
};
