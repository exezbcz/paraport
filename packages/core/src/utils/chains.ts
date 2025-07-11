import {
  existentialDeposit,
  teleportExistentialDeposit,
} from '@kodadot1/static'
import { Chain } from '../types'
import { chainPrefixOf } from '.'

export const edOf = (chain: Chain) => {
  return existentialDeposit[chainPrefixOf(chain)]
}

export const teleportEdOf = (chain: Chain) => {
  return teleportExistentialDeposit[chainPrefixOf(chain)]
}
