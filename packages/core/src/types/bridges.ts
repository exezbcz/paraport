import type { Action, Asset, Chain } from '.'
import type { BaseDetails } from '../base/BaseManager'

export type BridgeProtocol = 'XCM'

export type TeleportParams = {
	address: string
	sourceChain: Chain
	amount: string
	asset: Asset
	actions: Action[]
}

export type BrigeTransferParams = {
	amount: string
	from: Chain
	to: Chain
	address: string
	asset: string
}

export interface BridgeAdapter {
	protocol: BridgeProtocol
	getQuote(params: TeleportParams): Promise<Quote | null>
	transfer(params: BrigeTransferParams): Promise<string>
	getStatus(txHash: string): Promise<TransactionStatus>
	initialize(): Promise<void>
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

export enum TransactionStatus {
	PENDING = 'pending',
	PROCESSING = 'processing',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

export interface TransactionDetails
	extends BaseDetails<TransactionStatus, TransactionEvent> {
	chain: Chain
	details: Action
	telportId: string
}

export type TransactionEvent = {
	type: string
	timestamp: number
	data: unknown
}
