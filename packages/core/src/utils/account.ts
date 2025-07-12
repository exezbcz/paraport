import { encodeAddress } from '@polkadot/util-crypto'

export const formatAddress = (address: string, ss58Format: number) =>
	encodeAddress(address, ss58Format)
