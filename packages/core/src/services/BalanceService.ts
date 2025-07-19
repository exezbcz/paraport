import { balanceOf } from '@kodadot1/sub-api'
import pRetry from 'p-retry'
import type { Chain } from '../types'
import { chainPropListOf, formatAddress, transferableBalanceOf } from '../utils'
import type SubstrateApi from './SubstrateApi'

type Balance = {
	chain: Chain
	address: string
	asset: string
	amount: string
	transferable: string
}

export default class BalanceService {
	private api: SubstrateApi

	constructor(api: SubstrateApi) {
		this.api = api
	}

	async getBalances({
		address,
		asset,
		chains,
	}: { address: string; asset: string; chains: Chain[] }): Promise<Balance[]> {
		try {
			const balancePromises = chains.map(async (chainId) => {
				const api = await this.api.getInstance(chainId)

				// TODO: support non native assets
				const balance = await balanceOf(api, address)
				const amount = balance.toString()

				return {
					chain: chainId,
					asset,
					address: formatAddress(address, chainPropListOf(chainId).ss58Format),
					amount,
					transferable: transferableBalanceOf(amount, chainId).toString(),
				} as Balance
			})

			const balances = await Promise.all(balancePromises)

			return balances
		} catch (error: any) {
			throw new Error(`Failed to fetch balances: ${error.message}`)
		}
	}

	async waitForFunds({
		address,
		asset,
		chains,
		amount,
	}: {
		address: string
		asset: string
		chains: Chain[]
		amount: string
	}): Promise<Balance> {
		const getBalanceAttempt = async (): Promise<Balance> => {
			const balances = await this.getBalances({ address, asset, chains })
			if (
				balances.length > 0 &&
				Number(balances[0].transferable) >= Number(amount)
			) {
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
