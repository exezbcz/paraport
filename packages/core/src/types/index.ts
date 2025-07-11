import { BridgeProtocol } from "./bridges";
import type { Prefix } from '@kodadot1/static'

export type ChainPrefix = Prefix

export enum Asset {
  DOT = 'DOT',
  KSM = 'KSM'
}

export type SDKConfig = {
  bridgeProtocols?: BridgeProtocol[];
  rpcUrls?: Record<number | string, string>
  chains: Chain[]
}

export enum Chain {
  POLKADOT = 'Polkadot',
  ASSETHUBKUSAMA = 'AssetHubKusama',
  KUSAMA = 'Kusama',
  ASSETHUBPOLKADOT = 'AssetHubPolkadot',
}
