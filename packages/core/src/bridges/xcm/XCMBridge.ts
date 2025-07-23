import * as paraspell from '@paraspell/sdk-pjs'
import { maxBy } from 'lodash'
import { Initializable } from '../../base/Initializable'
import { ActionManager } from '../../managers/ActionManager'
import type BalanceService from '../../services/BalanceService'
import FeeService from '../../services/FeeService'
import type SubstrateApi from '../../services/SubstrateApi'
import type { Asset, Chain, SDKConfig } from '../../types'
import type {
	BridgeAdapter,
	BridgeProtocol,
	BrigeTransferParams,
	Quote,
	TeleportParams,
	TransactionCallback,
	TransactionStatus,
} from '../../types/bridges'
import { getChainsOfAsset } from '../../utils'
import { signAndSend } from '../../utils/tx'

type XCMTeleportParams = {
	amount: string
	source: Chain
	target: Chain
	address: string
	asset: Asset
}

export default class XCMBridge extends Initializable implements BridgeAdapter {
	protocol: BridgeProtocol = 'XCM'
	private readonly config: SDKConfig
	private balanceService: BalanceService
	private readonly api: SubstrateApi
	private readonly feeService: FeeService
	private readonly actionManager: ActionManager

	constructor(
		config: SDKConfig,
		balanceService: BalanceService,
		api: SubstrateApi,
	) {
		super()
		this.config = config
		this.api = api
		this.balanceService = balanceService
		this.feeService = new FeeService(this.api)
		this.actionManager = new ActionManager(this.api, this.config)
	}

	private async teleport({
		amount,
		source,
		target,
		address,
		asset,
	}: XCMTeleportParams) {
		const api = await this.api.getInstance(source)

		return paraspell
			.Builder(api)
			.from(source)
			.to(target)
			.currency({ symbol: asset, amount: amount })
			.address(address)
			.build()
	}

	private async getTeleportFees({
		amount,
		source,
		target,
		address,
		asset,
	}: XCMTeleportParams): Promise<string> {
		const tx = await this.teleport({
			amount: amount,
			source,
			target,
			address,
			asset,
		})

		return this.feeService.calculateFee(tx, address)
	}

	async getQuote({
		address,
		asset,
		chain: targetChain,
		amount,
		actions,
	}: TeleportParams): Promise<Quote | null> {
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
			(balance) => balance.chain !== targetChain,
		)

		const highestBalanceChain = maxBy(targetChainBalances, (balance) =>
			Number(balance.transferable),
		)

		if (!highestBalanceChain) {
			return null
		}

		const sourceChain = highestBalanceChain.chain

		// 4. calculate tx fees asoociated action and telport
		const [telportFees, actionsFees] = await Promise.all([
			this.getTeleportFees({
				amount,
				source: sourceChain,
				target: targetChain,
				address,
				asset,
			}),
			this.actionManager.estimate({
				actions: actions,
				chain: targetChain,
				address,
			}),
		])

		const totalFees = Number(telportFees) + Number(actionsFees)
		const totalAmount = Number(amount) + totalFees

		if (Number(highestBalanceChain.transferable) < totalAmount) {
			return null
		}

		return {
			route: {
				source: sourceChain,
				target: targetChain,
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

	async transfer(
		{ amount, from, to, address, asset }: BrigeTransferParams,
		callback: TransactionCallback,
	) {
		const tx = await this.teleport({
			amount,
			source: from,
			target: to,
			address,
			asset,
		})

		return signAndSend({
			tx,
			callback,
			address,
			signer: (await this.config.getSigner()) as any,
		})
	}

	getStatus(teleportId: string): Promise<TransactionStatus> {
		throw new Error('Method not implemented.')
	}

	async initialize(): Promise<void> {
		await Promise.all(this.config.chains.map(this.api.getInstance))
	}
}
