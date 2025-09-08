import type { IInitializable } from '@/base/Initializable'
import type { Quote } from '@/types/common'
import type { TeleportParams } from '@/types/teleport'
import type {
	TransactionCallback,
	TransactionUnsubscribe,
} from '@/types/transactions'
import type { Asset, Chain } from '@paraport/static'

export type BridgeProtocol = 'XCM'

export type BridgeTransferParams = {
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
		params: BridgeTransferParams,
		callback: TransactionCallback,
	): Promise<TransactionUnsubscribe>
	// getStatus(txHash: string): Promise<TransactionStatus>
}
