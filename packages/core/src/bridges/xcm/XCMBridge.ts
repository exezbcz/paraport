import * as paraspell from '@paraspell/sdk-pjs'
import { maxBy } from 'lodash'
import { Initializable } from '../../base/Initializable'
import { ActionManager } from '../../managers/ActionManager'
import BalanceService from '../../services/BalanceService'
import FeeService from '../../services/FeeService'
import SubstrateApi from '../../services/SubstrateApi'
import type { Chain, SDKConfig } from '../../types'
import type {
	BridgeAdapter,
	BridgeProtocol,
	Quote,
	TransferParams,
	TransferStatus,
} from '../../types/bridges'
import { getChainsOfAsset } from '../../utils'

type TeleportParams = {
	amount: string
	from: Chain
	to: Chain
	address: string
	asset: string
}

export default class XCMBridge extends Initializable implements BridgeAdapter {
	protocol: BridgeProtocol = 'XCM'
	private readonly config: SDKConfig
	private balanceService: BalanceService
	private readonly api: SubstrateApi
	private readonly feeService: FeeService
	private readonly actionManager: ActionManager

	constructor(config: SDKConfig) {
		super()
		this.config = config
		this.api = new SubstrateApi()
		this.balanceService = new BalanceService(this.api)
		this.feeService = new FeeService(this.api)
		this.actionManager = new ActionManager(this.api)
	}

	private async teleport({ amount, from, to, address, asset }: TeleportParams) {
		const api = await this.api.getInstance(from)

		return paraspell
			.Builder(api)
			.from(from)
			.to(to)
			.currency({ symbol: asset, amount: amount })
			.address(address)
			.build()
	}

	private async getTeleportFees({
		amount,
		from,
		to,
		address,
		asset,
	}: TeleportParams): Promise<string> {
		const tx = await this.teleport({
			amount: amount,
			from,
			to,
			address,
			asset,
		})

		return this.feeService.calculateFee(tx, address)
	}

	async getQuote({
		address,
		asset,
		sourceChain,
		amount,
		actions,
	}: TransferParams): Promise<Quote | null> {
		// 1. get chains where the token is avaialbe
		const chains = getChainsOfAsset(asset)

		// 2. get address balances on all chains where the token is avaialbe
		const balances = await this.balanceService.getBalances({
			address,
			chains,
			asset,
		})

		// 3. from possible target chains find the one with the highest transferable balance
		const targetChainBalances = balances.filter(
			(balance) => balance.chain !== sourceChain,
		)

		const highestBalanceChain = maxBy(targetChainBalances, (balance) =>
			Number(balance.transferable),
		)

		if (!highestBalanceChain) {
			return null
		}

		// 4. calculate tx fees asoociated action and telport
		const [telportFees, actionsFees] = await Promise.all([
			this.getTeleportFees({
				amount,
				from: sourceChain,
				to: highestBalanceChain.chain,
				address,
				asset,
			}),
			this.actionManager.estimate({
				actions: actions,
				chain: sourceChain,
				address,
			}),
		])

		const totalFees = Number(telportFees) + Number(actionsFees)
		const totalAmount = Number(amount) + totalFees

		if (Number(highestBalanceChain.transferable) > totalAmount) {
			return null
		}

		return {
			route: {
				source: sourceChain,
				target: highestBalanceChain.chain,
				protocol: this.protocol,
			},
			fees: {
				network: telportFees,
				actions: actionsFees,
				total: totalFees.toString(),
			},
			amount: amount,
			total: totalAmount.toString(),
		}
	}

	transfer(params: TransferParams): Promise<string> {
		throw new Error('Method not implemented.')
	}

	getStatus(teleportId: string): Promise<TransferStatus> {
		throw new Error('Method not implemented.')
	}

	async initialize(): Promise<void> {
		await Promise.all(this.config.chains.map(this.api.getInstance))
	}
}
