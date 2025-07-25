import type { Asset, Chain, Quote } from '.'
import type { TeleportParams } from './teleport'
import type {
	TransactionCallback,
	TransactionStatus,
	TransactionUnsubscribe,
} from './transactions'

export type BridgeProtocol = 'XCM'

export type BrigeTransferParams = {
	amount: string
	from: Chain
	to: Chain
	address: string
	asset: Asset
}

export interface BridgeAdapter {
	protocol: BridgeProtocol
	getQuote(params: TeleportParams): Promise<Quote | null>
	transfer(
		params: BrigeTransferParams,
		callback: TransactionCallback,
	): Promise<TransactionUnsubscribe>
	getStatus(txHash: string): Promise<TransactionStatus>
	initialize(): Promise<void>
}
