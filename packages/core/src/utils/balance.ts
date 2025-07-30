import type { Chain } from '../types/common'
import { edOf } from './chains'

export const transferableBalanceOf = (amount: bigint, chain: Chain): bigint => {
	return amount - edOf(chain)
}
