import {
	type TransactionCallback,
	TransactionStatus,
	type TransactionUnsubscribe,
} from '@/types/transactions'
import type { Extrinsic } from '@kodadot1/sub-api'
import type {
	DispatchError,
	ExtrinsicStatus,
	Hash,
} from '@polkadot/types/interfaces'
import type { ISubmittableResult, Signer } from '@polkadot/types/types'

type TxCbParams = {
	onFinalized: (params: {
		blockHash: Hash
		txHash: Hash
		error?: DispatchError
	}) => void
	onError: (params: { error: DispatchError; txHash: Hash }) => void
	onResult?: (params: {
		result: ISubmittableResult
		status: TransactionStatus
	}) => void
}

export const txCb =
	({ onFinalized, onError, onResult = console.log }: TxCbParams) =>
	(result: ISubmittableResult): void => {
		onResult({ result, status: resolveStatus(result.status) })

		if (result.dispatchError) {
			console.warn('[EXEC] dispatchError', result)
			onError({ error: result.dispatchError, txHash: result.txHash })
		}

		if (result.status.isFinalized) {
			console.log('[EXEC] Finalized', result)
			console.log(`[EXEC] blockHash ${result.status.asFinalized}`)
			onFinalized({
				blockHash: result.status.asFinalized,
				txHash: result.txHash,
				error: result.dispatchError,
			})
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

export const signAndSend = async ({
	tx,
	callback,
	address,
	signer,
}: {
	tx: Extrinsic
	callback: TransactionCallback
	address: string
	signer: Signer
}): Promise<TransactionUnsubscribe> => {
	const subscription = await tx
		.signAndSend(
			address,
			{ signer },
			txCb({
				onFinalized: ({ txHash, error }) => {
					callback({
						status: TransactionStatus.Finalized,
						txHash: txHash.toString(),
						error: error?.toString(),
					})
				},
				onError: ({ error, txHash }) => {
					callback({
						status: TransactionStatus.Block,
						error: error.toString(),
						txHash: txHash.toString(),
					})
				},
				onResult: ({ result, status }) => {
					if (status !== TransactionStatus.Finalized && !result.dispatchError) {
						callback({
							status,
							txHash: result.txHash.toString(),
						})
					}
				},
			}),
		)
		.catch(() => {
			callback({
				status: TransactionStatus.Cancelled,
			})
		})

	return subscription || undefined
}
