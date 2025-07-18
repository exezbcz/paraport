import type { Action, Asset, Chain } from '.'
import type { BaseDetails, BaseDetailsEvent } from '../base/BaseManager'

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

export type BrigeTransferCallback = (
	props:
		| {
				status: TransactionStatus.Finalized
				txHash: string
		  }
		| {
				status: TransactionStatus.Block
				error: string
		  }
		| {
				status: Exclude<
					TransactionStatus,
					TransactionStatus.Finalized | TransactionStatus.Block
				>
		  },
) => void

export interface BridgeAdapter {
	protocol: BridgeProtocol
	getQuote(params: TeleportParams): Promise<Quote | null>
	transfer(
		params: BrigeTransferParams,
		callback: BrigeTransferCallback,
	): Promise<() => void>
	getStatus(txHash: string): Promise<TransactionStatus>
	initialize(): Promise<void>
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

// TODO move to seperate file transaction related types

export enum TransactionStatus {
	Broadcast = 'broadcast',
	Casting = 'casting',
	Sign = 'sign',
	Block = 'block',
	Finalized = 'finalized',
	Unknown = '',
	Cancelled = 'cancelled',
}

export type TransactionType = 'Teleport' | 'Action'

export interface TransactionDetails
	extends BaseDetails<
		TransactionStatus,
		BaseDetailsEvent<{ status: TransactionStatus; error?: string }>
	> {
	chain: Chain
	details: BrigeTransferParams | Action
	teleportId: string
	type: TransactionType
}
