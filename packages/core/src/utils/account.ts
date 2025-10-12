import { ss58Of } from '@/utils/chains'
import type { Chain } from '@paraport/static'
import { decodeAddress, encodeAddress } from 'dedot/utils'

export const formatAddress = (address: string, chain: Chain) =>
	encodeAddress(address, ss58Of(chain))

export const isValidAddress = (address: string) => {
	try {
		encodeAddress(decodeAddress(address))
		return true
	} catch (error) {
		return false
	}
}
