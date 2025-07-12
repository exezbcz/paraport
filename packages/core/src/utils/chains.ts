import {
	existentialDeposit,
	teleportExistentialDeposit,
} from '@kodadot1/static'
import { chainPrefixOf } from '.'
import type { Chain } from '../types'

export const edOf = (chain: Chain) => {
	return existentialDeposit[chainPrefixOf(chain)]
}

export const teleportEdOf = (chain: Chain) => {
	return teleportExistentialDeposit[chainPrefixOf(chain)]
}
