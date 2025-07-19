import FeeService from '../services/FeeService'
import type SubstrateApi from '../services/SubstrateApi'
import type { Action, Chain, SDKConfig } from '../types'
import type {
	TransactionCallback,
	TransactionUnsubscribe,
} from '../types/bridges'
import { signAndSend } from '../utils/tx'

export class ActionManager {
	private readonly feeService: FeeService

	constructor(
		private api: SubstrateApi,
		private config: SDKConfig,
	) {
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
		{
			action,
			address,
			chain,
		}: { action: Action; address: string; chain: Chain },
		callback: TransactionCallback,
	): Promise<TransactionUnsubscribe> {
		const tx = await this.createTx(action, chain)

		return signAndSend({
			tx,
			callback,
			address,
			signer: (await this.config.getSigner()) as any,
		})
	}

	private async createTx(action: Action, chain: Chain) {
		const api = await this.api.getInstance(chain)
		return api.tx[action.section][action.method](...action.args)
	}
}
