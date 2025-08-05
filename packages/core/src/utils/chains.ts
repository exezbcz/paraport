import type { Chain } from '@/types/common'
import { chainPrefixOf } from '@/utils'
import {
	existentialDeposit,
	teleportExistentialDeposit,
} from '@kodadot1/static'

export const edOf = (chain: Chain): bigint => {
	return BigInt(existentialDeposit[chainPrefixOf(chain)])
}

export const teleportEdOf = (chain: Chain): bigint => {
	return BigInt(teleportExistentialDeposit[chainPrefixOf(chain)])
}
