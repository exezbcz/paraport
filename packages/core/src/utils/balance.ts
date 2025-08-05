import type { Chain } from '@/types/common'
import { edOf } from '@/utils/chains'

export const transferableBalanceOf = (amount: bigint, chain: Chain): bigint => {
	return amount - edOf(chain)
}
