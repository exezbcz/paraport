import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'

export const formatAddress = (address: string, ss58Format: number) =>
	encodeAddress(address, ss58Format)

export const isValidAddress = (address: string) => {
	try {
		encodeAddress(decodeAddress(address))
		return true
	} catch (error) {
		return false
	}
}
