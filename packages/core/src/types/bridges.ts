import type { IInitializable } from '../base/Initializable'
import type { Asset, Chain, Quote } from './common'
import type { TeleportParams } from './teleport'
import type {
	TransactionCallback,
	TransactionUnsubscribe,
} from './transactions'

export type BridgeProtocol = 'XCM'

export type BrigeTransferParams = {
	amount: bigint
	from: Chain
	to: Chain
	address: string
	asset: Asset
}

export interface BridgeAdapter extends IInitializable {
	protocol: BridgeProtocol
	getQuote(params: TeleportParams): Promise<Quote | null>
	transfer(
		params: BrigeTransferParams,
		callback: TransactionCallback,
	): Promise<TransactionUnsubscribe>
	// getStatus(txHash: string): Promise<TransactionStatus>
}
