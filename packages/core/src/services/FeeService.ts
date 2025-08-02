import type { SubmittableExtrinsic } from '@polkadot/api/types'
import type { ISubmittableResult } from '@polkadot/types/types'
import type SubstrateApi from './SubstrateApi'

export default class FeeService {
	constructor(private api: SubstrateApi) {}

	async calculateFee(
		tx: SubmittableExtrinsic<'promise', ISubmittableResult>,
		address: string,
	): Promise<bigint> {
		const paymentInfo = await tx.paymentInfo(address)
		return BigInt(paymentInfo.partialFee.toString())
	}

	async calculateBatchFees(
		txs: SubmittableExtrinsic<'promise', ISubmittableResult>[],
		address: string,
	): Promise<bigint> {
		const fees = await Promise.all(
			txs.map((tx) => this.calculateFee(tx, address)),
		)

		return fees.reduce((total, fee) => BigInt(total) + BigInt(fee), BigInt(0))
	}
}
