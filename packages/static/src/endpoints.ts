import type { Config } from "./types";
import { Chain } from "./types";

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

const AHP_ENDPOINTS: WS_URL[] = [
	"wss://statemint.api.onfinality.io/public-ws",
	"wss://polkadot-asset-hub-rpc.polkadot.io",
	"wss://sys.ibp.network/statemint",
	"wss://statemint-rpc.dwellir.com",
	"wss://statemint-rpc-tn.dwellir.com",
	"wss://sys.dotters.network/statemint",
];

const AHK_ENDPOINTS: WS_URL[] = [
	"wss://sys.ibp.network/statemine",
	"wss://statemine-rpc.dwellir.com",
	"wss://sys.dotters.network/statemine",
	"wss://rpc-asset-hub-kusama.luckyfriday.io",
	"wss://statemine.public.curie.radiumblock.co/ws",
];

const HYDRATION_ENDPOINTS: WS_URL[] = [
	"wss://hydradx.api.onfinality.io/public-ws",
	"wss://hydradx-rpc.polkadot.io",
	"wss://sys.ibp.network/hydradx",
	"wss://hydradx-rpc.dwellir.com",
	"wss://hydradx-rpc-tn.dwellir.com",
	"wss://sys.dotters.network/hydradx",
];

// Someone from HydraDX team told me that Polkadot API takes Array of endpoints
export const ALTERNATIVE_ENDPOINT_MAP: Config<ENDPOINT_URL[]> = {
	[Chain.Polkadot]: POLKADOT_ENDPOINTS,
	[Chain.AssetHubPolkadot]: AHP_ENDPOINTS,
	[Chain.Kusama]: KUSAMA_ENDPOINTS,
	[Chain.AssetHubKusama]: AHK_ENDPOINTS,
	[Chain.Hydration]: HYDRATION_ENDPOINTS,
};

export const ENDPOINT_MAP: Config<ENDPOINT_URL> = {
	[Chain.Polkadot]: POLKADOT_ENDPOINTS[0],
	[Chain.AssetHubPolkadot]: AHP_ENDPOINTS[0],
	[Chain.Kusama]: KUSAMA_ENDPOINTS[0],
	[Chain.AssetHubKusama]: AHK_ENDPOINTS[0],
	[Chain.Hydration]: "wss://rpc.hydradx.cloud",
};
