import FeeService from '../services/FeeService'
import type SubstrateApi from '../services/SubstrateApi'
import type { Action, Chain } from '../types'

export class ActionManager {
	private readonly feeService: FeeService

	constructor(private api: SubstrateApi) {
		this.feeService = new FeeService(this.api)
	}

	async estimate({
		actions,
		chain,
		address,
	}: { actions: Action[]; chain: Chain; address: string }): Promise<string> {
		if (!actions.length) return '0'

		const txs = await Promise.all(
			actions.map((action) => this.createTx(action, chain)),
		)

		return this.feeService.calculateBatchFees(txs, address)
	}

	async execute(
		actions: Action[],
		address: string,
		chain: Chain,
	): Promise<string[]> {
		throw new Error('Not implemented')
	}

	private async createTx(action: Action, chain: Chain) {
		const api = await this.api.getInstance(chain)
		return api.tx[action.section][action.method](...action.args)
	}
}
