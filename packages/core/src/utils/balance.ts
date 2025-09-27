import { edOf, teleportEdOf } from '@/utils/chains'
import type { Chain } from '@paraport/static'

export const transferableBalanceOf = (amount: bigint, chain: Chain): bigint => {
	return amount - edOf(chain)
}

export const xcmSafeBalanceOf = (amount: bigint, chain: Chain): bigint => {
	return amount - teleportEdOf(chain)
}
