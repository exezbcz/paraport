import {
	type TransactionCallback,
	type TransactionStatus,
	TransactionStatuses,
	type TransactionUnsubscribe,
} from '@/types/transactions'
import type { Extrinsic } from '@kodadot1/sub-api'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'
import type {
	DispatchError,
	ExtrinsicStatus,
	Hash,
} from '@polkadot/types/interfaces'
import type { ISubmittableResult, Signer } from '@polkadot/types/types'

const WEB3_APP_NAME = 'ParaPort'

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
		return TransactionStatuses.Broadcast
	}

	if (extrinsicStatus.isReady) {
		return TransactionStatuses.Casting
	}

	if (extrinsicStatus.isInBlock) {
		return TransactionStatuses.Block
	}

	if (extrinsicStatus.isFinalized) {
		return TransactionStatuses.Finalized
	}

	return TransactionStatuses.Unknown
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
	signer?: Signer
}): Promise<TransactionUnsubscribe> => {
	await web3Enable(WEB3_APP_NAME)

	const subscription = await tx
		.signAndSend(
			address,
			{ signer: signer || (await web3FromAddress(address)).signer },
			txCb({
				onFinalized: ({ txHash, error }) => {
					callback({
						status: TransactionStatuses.Finalized,
						txHash: txHash.toString(),
						error: error?.toString(),
					})
				},
				onError: ({ error, txHash }) => {
					callback({
						status: TransactionStatuses.Block,
						error: error.toString(),
						txHash: txHash.toString(),
					})
				},
				onResult: ({ result, status }) => {
					if (
						status !== TransactionStatuses.Finalized &&
						!result.dispatchError
					) {
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
				status: TransactionStatuses.Cancelled,
			})
		})

	return subscription || undefined
}
