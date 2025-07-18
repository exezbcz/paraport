import type {
	DispatchError,
	ExtrinsicStatus,
	Hash,
} from '@polkadot/types/interfaces'
import type { ISubmittableResult } from '@polkadot/types/types'
import { TransactionStatus } from '../types/bridges'

type TxCbParams = {
	onSuccess: (prams: { blockHash: Hash; txHash: Hash }) => void
	onError: (err: DispatchError) => void
	onResult?: (params: {
		result: ISubmittableResult
		status: TransactionStatus
	}) => void
}

export const txCb =
	({ onSuccess, onError, onResult = console.log }: TxCbParams) =>
	(result: ISubmittableResult): void => {
		onResult({ result, status: resolveStatus(result.status) })

		if (result.dispatchError) {
			onError(result.dispatchError)
		}

		if (result.status.isFinalized) {
			onSuccess({ blockHash: result.status.asFinalized, txHash: result.txHash })
		}
	}

export const resolveStatus = (
	extrinsicStatus: ExtrinsicStatus,
): TransactionStatus => {
	if (extrinsicStatus.isBroadcast) {
		return TransactionStatus.Broadcast
	}

	if (extrinsicStatus.isReady) {
		return TransactionStatus.Casting
	}

	if (extrinsicStatus.isInBlock) {
		return TransactionStatus.Block
	}

	if (extrinsicStatus.isFinalized) {
		return TransactionStatus.Finalized
	}

	return TransactionStatus.Unknown
}
