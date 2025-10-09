import { Initializable } from '@/base/Initializable'
import type BalanceService from '@/services/BalanceService'
import type { Balance } from '@/services/BalanceService'
import type SubstrateApi from '@/services/SubstrateApi'
import type {
	BridgeAdapter,
	BridgeProtocol,
	BrigeTransferParams,
} from '@/types/bridges'
import type { Quote, SDKConfig } from '@/types/common'
import {
	type TeleportMode,
	TeleportModes,
	type TeleportParams,
} from '@/types/teleport'
import type { TransactionCallback } from '@/types/transactions'
import { formatAddress, getChainsOfAsset } from '@/utils'
import { signAndSend } from '@/utils/tx'
import type { Asset, Chain } from '@paraport/static'
import * as paraspell from '@paraspell/sdk-pjs'
import { maxBy } from 'lodash'

type XCMTeleportParams = {
	amount: bigint
	originChain: Chain
	destinationChain: Chain
	address: string
	asset: Asset
}

export default class XCMBridge extends Initializable implements BridgeAdapter {
	protocol: BridgeProtocol = 'XCM'
	private readonly signatureAmount: number = 1

	constructor(
		private readonly config: SDKConfig,
		private readonly balanceService: BalanceService,
		private readonly api: SubstrateApi,
	) {
		super()
		this.api = api
	}

	private async getParaspellQuery({
		amount,
		originChain,
		destinationChain,
		address,
		asset,
	}: XCMTeleportParams) {
		const api = await this.api.getInstance(originChain)

		return paraspell
			.Builder(api)
			.from(originChain)
			.to(destinationChain)
			.currency({ symbol: asset, amount })
			.address(formatAddress(address, destinationChain))
			.senderAddress(formatAddress(address, originChain))
	}

	private async getXcmFee({
		amount,
		originChain,
		destinationChain,
		address,
		asset,
		estimate,
	}: XCMTeleportParams & { estimate?: boolean }): Promise<bigint> {
		const query = await this.getParaspellQuery({
			amount,
			originChain,
			destinationChain,
			address,
			asset,
		})

		try {
			const { origin, destination } = await query
				.feeAsset({ symbol: asset })
				[estimate ? 'getXcmFeeEstimate' : 'getXcmFee']()

			return BigInt(origin.fee || 0) + BigInt(destination.fee || 0)
		} catch (error) {
			console.log('Failed getting Xcm fee', error)
			throw error
		}
	}

	private calculateTeleportAmount({
		amount,
		xcmFee,
		currentChainBalance,
		teleportMode,
	}: {
		amount: bigint
		teleportMode: TeleportMode
		currentChainBalance: Balance
		xcmFee: bigint
	}) {
		if (TeleportModes.Expected === teleportMode) {
			return amount - currentChainBalance.transferable + xcmFee
		}
		if (TeleportModes.Only === teleportMode) {
			return amount - xcmFee
		}
		return amount // TeleportModes.Exact
	}

	async getQuote({
		address,
		asset,
		chain: destinationChain,
		amount,
		mode = TeleportModes.Expected,
	}: TeleportParams): Promise<Quote | null> {
		// 1. get chains where the token is available
		const chains = getChainsOfAsset(asset).filter((chain) =>
			this.config.chains.includes(chain),
		)

		// 2. get address balances on all chains where the token is available
		const balances = await this.balanceService.getBalances({
			address,
			chains,
			asset,
		})

		const currentChainBalance = balances.find(
			(balance) => balance.chain === destinationChain,
		)

		// 3. from possible target chains find the one with the highest transferable balance
		const targetChainBalances = balances.filter(
			(balance) => balance.chain !== destinationChain,
		)

		const highestBalanceChain = maxBy(
			targetChainBalances,
			(balance) => balance.transferable,
		)

		if (!highestBalanceChain || !currentChainBalance) {
			return null
		}

		const originChain = highestBalanceChain.chain

		// 4. calculate amount to teleport
		const estimateXcmFee = await this.getXcmFee({
			amount,
			originChain,
			destinationChain,
			address,
			asset,
			estimate: true,
		})

		const estimateTeleportAmount = this.calculateTeleportAmount({
			amount,
			xcmFee: estimateXcmFee,
			currentChainBalance: currentChainBalance,
			teleportMode: TeleportModes.Expected,
		})

		// First simulate the XCM fee (less accurate) to get an estimate
		// We need to use a valid amount for the actual fee calculation to avoid dry run failure
		const xcmFee = await this.getXcmFee({
			amount: estimateTeleportAmount,
			originChain,
			destinationChain,
			address,
			asset,
		})

		const amountToTeleport = this.calculateTeleportAmount({
			amount,
			xcmFee,
			currentChainBalance,
			teleportMode: mode,
		})

		if (
			currentChainBalance.transferable + highestBalanceChain.transferable <
			amountToTeleport
		) {
			return null
		}

		if (amountToTeleport <= 0) {
			return null
		}

		const totalFees = xcmFee
		const receivingAmount = amountToTeleport - totalFees

		return {
			mode: mode,
			amount: receivingAmount,
			total: amountToTeleport,
			asset: asset,
			route: {
				origin: originChain,
				destination: destinationChain,
				protocol: this.protocol,
			},
			fees: {
				bridge: xcmFee,
				total: totalFees,
			},
			execution: {
				signatureAmount: this.signatureAmount,
				timeMs: 30000,
			},
		}
	}

	async transfer(
		{
			amount,
			from: originChain,
			to: destinationChain,
			address,
			asset,
		}: BrigeTransferParams,
		callback: TransactionCallback,
	) {
		const query = await this.getParaspellQuery({
			amount,
			originChain,
			destinationChain,
			address,
			asset,
		})

		const tx = await query.build()

		return signAndSend({
			tx,
			callback,
			address,
			signer: await this.config.getSigner?.(),
		})
	}

	async initialize(): Promise<void> {
		await Promise.all(this.config.chains.map(this.api.getInstance))
	}
}
