import { formatBalance } from '@polkadot/util'

export function formatAmount(
	amount: number | string | bigint,
	decimals: number,
	withUnit?: boolean | string,
) {
	try {
		const fixedAmount = typeof amount === 'number' ? amount.toFixed() : amount

		return formatBalance(fixedAmount, {
			decimals,
			withUnit,
			forceUnit: '-',
		})
	} catch (e) {
		return ''
	}
}
