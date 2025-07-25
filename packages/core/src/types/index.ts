import type { Prefix } from '@kodadot1/static'
import type { BridgeProtocol } from './bridges'

export type ChainPrefix = Prefix

export enum Asset {
	DOT = 'DOT',
	KSM = 'KSM',
}

export type SDKConfig = {
	bridgeProtocols?: BridgeProtocol[]
	rpcUrls?: Record<number | string, string>
	chains: Chain[]
	getSigner: () => Promise<unknown>
}

export enum Chain {
	POLKADOT = 'Polkadot',
	ASSETHUBKUSAMA = 'AssetHubKusama',
	KUSAMA = 'Kusama',
	ASSETHUBPOLKADOT = 'AssetHubPolkadot',
}

export type Action = {
	section: string
	method: string
	args: unknown[]
}

export type Route = {
	source: Chain
	target: Chain
	protocol: BridgeProtocol
}

export type Quote = {
	route: Route
	fees: {
		network: string
		actions?: string
		total: string
	}
	amount: string
	total: string
}
