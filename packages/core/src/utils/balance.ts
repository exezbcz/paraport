import type { Chain } from '../types/common'
import { edOf } from './chains'

export const transferableBalanceOf = (amount: string, chain: Chain): number => {
	return Number(amount) - edOf(chain)
}
