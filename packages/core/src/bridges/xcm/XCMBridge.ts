import { Initializable } from '@/base/Initializable'
import { ActionManager } from '@/managers/ActionManager'
import type BalanceService from '@/services/BalanceService'
import FeeService from '@/services/FeeService'
import type SubstrateApi from '@/services/SubstrateApi'
import type {
	BridgeAdapter,
	BridgeProtocol,
	BrigeTransferParams,
} from '@/types/bridges'
import type { Action, Asset, Chain, Quote, SDKConfig } from '@/types/common'
import type { TeleportParams } from '@/types/teleport'
import type { TransactionCallback } from '@/types/transactions'
import { getChainsOfAsset } from '@/utils'
import { signAndSend } from '@/utils/tx'
import * as paraspell from '@paraspell/sdk-pjs'
import { maxBy } from 'lodash'

type XCMTeleportParams = {
	amount: bigint
	source: Chain
	target: Chain
	address: string
	asset: Asset
}

export default class XCMBridge extends Initializable implements BridgeAdapter {
	protocol: BridgeProtocol = 'XCM'

	private readonly feeService: FeeService
	private readonly actionManager: ActionManager

	constructor(
		private readonly config: SDKConfig,
		private readonly balanceService: BalanceService,
		private readonly api: SubstrateApi,
	) {
		super()
		this.api = api
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
	}: XCMTeleportParams): Promise<bigint> {
		const tx = await this.teleport({
			amount,
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
	}: TeleportParams): Promise<Quote | null> {
		const actions = [] as Action[]

		// 1. get chains where the token is available
		const chains = getChainsOfAsset(asset)
		// TODO: filter by selected chains

		// 2. get address balances on all chains where the token is available
		const balances = await this.balanceService.getBalances({
			address,
			chains,
			asset,
		})

		const currentChainBalance = balances.find(
			(balance) => balance.chain === targetChain,
		)

		// 3. from possible target chains find the one with the highest transferable balance
		const targetChainBalances = balances.filter(
			(balance) => balance.chain !== targetChain,
		)

		const highestBalanceChain = maxBy(
			targetChainBalances,
			(balance) => balance.transferable,
		)

		if (!highestBalanceChain || !currentChainBalance) {
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

		const totalFees = telportFees + actionsFees
		const totalAmount = amount + totalFees

		if (
			currentChainBalance.transferable + highestBalanceChain.transferable <
			totalAmount
		) {
			return null
		}

		const neededAmount = amount - currentChainBalance.transferable

		const total = neededAmount + totalFees

		return {
			amount: neededAmount,
			total: total,
			asset: asset,
			route: {
				source: sourceChain,
				target: targetChain,
				protocol: this.protocol,
			},
			fees: {
				bridge: telportFees,
				actions: actionsFees,
				total: totalFees,
			},
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
			signer: await this.config.getSigner(),
		})
	}

	async initialize(): Promise<void> {
		await Promise.all(this.config.chains.map(this.api.getInstance))
	}
}
