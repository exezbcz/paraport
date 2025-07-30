import {
	existentialDeposit,
	teleportExistentialDeposit,
} from '@kodadot1/static'
import { chainPrefixOf } from '.'
import type { Chain } from '../types/common'

export const edOf = (chain: Chain): bigint => {
	return BigInt(existentialDeposit[chainPrefixOf(chain)])
}

export const teleportEdOf = (chain: Chain): bigint => {
	return BigInt(teleportExistentialDeposit[chainPrefixOf(chain)])
}
