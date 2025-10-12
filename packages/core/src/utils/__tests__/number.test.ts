import { describe, expect, it } from 'vitest'
import { convertToBigInt } from '@/utils/number'

describe('convertToBigInt', () => {
  it('converts only targeted string keys to bigint', () => {
    const input = { a: '123', b: '456', c: 10, d: 'noop' }
    const out = convertToBigInt(input, ['a', 'b']) as any
    expect(out.a).toBe(123n)
    expect(out.b).toBe(456n)
    expect(out.c).toBe(10)
    expect(out.d).toBe('noop')
  })

  it('ignores missing keys', () => {
    const input = { x: '1' }
    const out = convertToBigInt(input as any, ['y'] as any)
    expect(out).toEqual(input)
  })
})

