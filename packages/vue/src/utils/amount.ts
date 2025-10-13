import { formatBalance } from 'dedot/utils'

export function formatAmount(
  amount: number | string | bigint,
  decimals: number,
  symbol: string,
) {
  try {
    const fixedAmount = typeof amount === 'number' ? amount.toFixed() : amount

    return formatBalance(fixedAmount, { decimals, symbol })
  }
  catch {
    return ''
  }
}
