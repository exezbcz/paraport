import type { Action, Asset, Chain } from '.'

export type BridgeProtocol = 'XCM'

export type TransferParams = {
	address: string
	sourceChainId: Chain
	amount: string
	asset: Asset
	actions: Action[]
}

export interface BridgeAdapter {
	protocol: BridgeProtocol
	getQuote(params: TransferParams): Promise<Quote | null>
	transfer(params: TransferParams): Promise<string>
	getStatus(txHash: string): Promise<TransferStatus>
}

export type TransferStatus = {
	status: 'pending' | 'completed' | 'failed'
}

export type Quote = {
	route: {
		source: Chain
		target: Chain
		protocol: BridgeProtocol
	}
	fees: {
		network: string
		actions?: string
		total: string
	}
	amount: string
	total: string
}
