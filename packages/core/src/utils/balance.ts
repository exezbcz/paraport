import { edOf } from '@/utils/chains'
import type { Chain } from '@paraport/static'

export const transferableBalanceOf = (amount: bigint, chain: Chain): bigint => {
	return amount - edOf(chain)
}
