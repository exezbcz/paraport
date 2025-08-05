import type { IInitializable } from '@/base/Initializable'
import type { Asset, Chain, Quote } from '@/types/common'
import type { TeleportParams } from '@/types/teleport'
import type {
	TransactionCallback,
	TransactionUnsubscribe,
} from '@/types/transactions'

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
