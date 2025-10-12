import { describe, expect, it, vi } from 'vitest'

vi.mock('dedot/utils', () => ({
  decodeAddress: vi.fn((addr: string) => {
    if (addr === 'bad') throw new Error('decode fail')
    return new Uint8Array([1, 2, 3])
  }),
  encodeAddress: vi.fn((_u8?: any, _prefix?: number) => 'ENCODED'),
}))

vi.mock('@/utils/chains', () => ({
  ss58Of: vi.fn(() => 42),
}))

import { isValidAddress, formatAddress } from '@/utils/account'
import { SUBSTRATE_ADDRESS } from '@/__tests__/utils/constants'
import { encodeAddress } from 'dedot/utils'

describe('account utils', () => {
  it('isValidAddress true/false', () => {
    expect(isValidAddress('good')).toBe(true)
    expect(isValidAddress('bad')).toBe(false)
  })

  it('formatAddress uses ss58Of and encodeAddress', () => {
    const out = formatAddress(SUBSTRATE_ADDRESS, 'SomeChain' as any)
    expect(out).toBe('ENCODED')
    expect(encodeAddress).toHaveBeenCalled()
  })
})
