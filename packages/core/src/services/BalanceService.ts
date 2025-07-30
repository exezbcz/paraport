import { balanceOf } from '@kodadot1/sub-api'
import type { AccountInfo } from '@polkadot/types/interfaces'
import pRetry from 'p-retry'
import type { Asset, Chain } from '../types/common'
import { chainPropListOf, formatAddress, transferableBalanceOf } from '../utils'
import type SubstrateApi from './SubstrateApi'

type Balance = {
	chain: Chain
	address: string
	asset: Asset
	amount: bigint
	transferable: bigint
}

type GetBalancesParams = {
	address: string
	asset: Asset
	chains: Chain[]
}

type GetBalanceParams = { chain: Chain; address: string; asset: Asset }

export default class BalanceService {
	private api: SubstrateApi

	constructor(api: SubstrateApi) {
		this.api = api
	}

	async hasEnoughBalance({
		chain,
		address,
		asset,
		amount,
	}: GetBalanceParams & { amount: bigint }) {
		const balance = await this.getBalance({ chain, address, asset })

		return balance.transferable >= BigInt(amount)
	}

	private async getBalance({
		chain,
		address,
		asset,
	}: GetBalanceParams): Promise<Balance> {
		const api = await this.api.getInstance(chain)

		// TODO: support non native assets
		const balance = await balanceOf(api, address)
		const amount = BigInt(balance)

		return {
			chain,
			asset,
			address: formatAddress(address, chainPropListOf(chain).ss58Format),
			amount,
			transferable: transferableBalanceOf(amount, chain),
		} as Balance
	}

	async getBalances({
		address,
		asset,
		chains,
	}: GetBalancesParams): Promise<Balance[]> {
		try {
			const balancePromises = chains.map(async (chain) => {
				return this.getBalance({ chain, address, asset })
			})

			const balances = await Promise.all(balancePromises)

			return balances
		} catch (error: any) {
			throw new Error(`Failed to fetch balances: ${error.message}`)
		}
	}

	async subscribeBalances(
		{ address, chains }: GetBalancesParams,
		callback: () => void = () => {},
	) {
		const balancePromises = chains.map(async (chainId) => {
			const api = await this.api.getInstance(chainId)

			let {
				data: { free: previousFree },
			} = (await api.query.system.account(address)) as AccountInfo

			return api.query.system.account(
				address,
				({ data: { free: currentFree } }: AccountInfo) => {
					const change = currentFree.sub(previousFree)

					if (!change.isZero()) {
						callback()
						previousFree = currentFree
					}
				},
			)
		})

		return await Promise.all(balancePromises)
	}

	async waitForFunds({
		address,
		asset,
		chains,
		amount,
	}: {
		address: string
		asset: Asset
		chains: Chain[]
		amount: bigint
	}): Promise<Balance> {
		const getBalanceAttempt = async (): Promise<Balance> => {
			const balances = await this.getBalances({ address, asset, chains })
			if (balances.length > 0 && balances[0].transferable >= amount) {
				return balances[0]
			}
			throw new Error('Not enough balance yet.')
		}

		try {
			const balance = await pRetry(getBalanceAttempt, {
				retries: 100,
				minTimeout: 5000,
				maxTimeout: 10000,
			})
			return balance
		} catch (error) {
			console.error('Error waiting for sufficient balance:', error)
			throw error
		}
	}
}
