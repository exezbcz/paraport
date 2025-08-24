import {
	type Chain,
	existentialDeposit,
	teleportExistentialDeposit,
} from '@paraport/static'

export const edOf = (chain: Chain): bigint => {
	return BigInt(existentialDeposit[chain])
}

export const teleportEdOf = (chain: Chain): bigint => {
	return BigInt(teleportExistentialDeposit[chain])
}
