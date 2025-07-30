import type SubstrateApi from './SubstrateApi'

export default class FeeService {
	constructor(private api: SubstrateApi) {}

	async calculateFee(tx: any, address: string): Promise<bigint> {
		const paymentInfo = await tx.paymentInfo(address)
		return BigInt(paymentInfo.partialFee)
	}

	async calculateBatchFees(txs: any[], address: string): Promise<bigint> {
		const fees = await Promise.all(
			txs.map((tx) => this.calculateFee(tx, address)),
		)

		return fees.reduce((total, fee) => BigInt(total) + BigInt(fee), BigInt(0))
	}
}
