import type SubstrateApi from './SubstrateApi'

export default class FeeService {
	constructor(private api: SubstrateApi) {}

	async calculateFee(tx: any, address: string): Promise<string> {
		const paymentInfo = await tx.paymentInfo(address)
		return paymentInfo.partialFee.toString()
	}

	async calculateBatchFees(txs: any[], address: string): Promise<string> {
		const fees = await Promise.all(
			txs.map((tx) => this.calculateFee(tx, address)),
		)

		return fees
			.reduce((total, fee) => BigInt(total) + BigInt(fee), BigInt(0))
			.toString()
	}
}
