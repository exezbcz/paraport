import { describe, expect, it, vi } from 'vitest'
import { signAndSend } from '@/utils/tx'
import { dummySigner } from '@/__tests__/utils/test-helpers'
import { TransactionStatuses } from '@/types/transactions'

const makeTx = (handlers: {
  onSubscribe?: (observer: { next: (e: any) => void; error: (e: any) => void }) => void
  unsubscribe?: () => void
}) => {
  const unsubscribe = handlers.unsubscribe || vi.fn()
  return {
    signSubmitAndWatch: vi.fn().mockReturnValue({
      subscribe: ({ next, error }: any) => {
        handlers.onSubscribe?.({ next, error })
        return { unsubscribe }
      },
    }),
  }
}

describe('signAndSend', () => {
  it('emits status sequence and returns unsubscribe', async () => {
    const calls: any[] = []
    const callback = (e: any) => calls.push(e)
    const unsubscribe = vi.fn()

    const tx = makeTx({
      unsubscribe,
      onSubscribe: ({ next }) => {
        next({ type: 'broadcasted', txHash: { toString: () => '0xaaa' } })
        next({ type: 'signed', txHash: { toString: () => '0xbbb' } })
        next({ type: 'txBestBlocksState', txHash: { toString: () => '0xccc' } })
        next({ type: 'finalized', txHash: { toString: () => '0xddd' } })
      },
    }) as any

    const unsub = await signAndSend({ transaction: tx, callback, signer: dummySigner() })

    expect(typeof unsub).toBe('function')
    expect(unsubscribe).not.toHaveBeenCalled()

    // Intermediate statuses + finalized
    expect(calls.map((c) => c.status)).toEqual([
      TransactionStatuses.Broadcast,
      TransactionStatuses.Casting,
      TransactionStatuses.Block,
      TransactionStatuses.Finalized,
    ])
    expect(calls.at(-1)).toMatchObject({ status: TransactionStatuses.Finalized, error: undefined })
  })

  it('suppresses txBestBlocksState with dispatchError, but reports final error', async () => {
    const calls: any[] = []
    const callback = (e: any) => calls.push(e)

    const tx = makeTx({
      onSubscribe: ({ next }) => {
        next({ type: 'broadcasted', txHash: { toString: () => '0xaaa' } })
        next({
          type: 'txBestBlocksState',
          txHash: { toString: () => '0xbbb' },
          found: true,
          dispatchError: { type: 'Module' },
        })
        next({ type: 'finalized', txHash: { toString: () => '0xccc' }, dispatchError: { type: 'Module' } })
      },
    }) as any

    await signAndSend({ transaction: tx, callback, signer: dummySigner() })

    // No Block status for the error in best-blocks, but final includes error
    expect(calls.map((c) => c.status)).toEqual([
      TransactionStatuses.Broadcast,
      TransactionStatuses.Finalized,
    ])
    expect(calls.at(-1)).toMatchObject({ status: TransactionStatuses.Finalized, error: 'Module' })
  })

  it('emits Block with error when subscription errors', async () => {
    const calls: any[] = []
    const callback = (e: any) => calls.push(e)

    const tx = makeTx({
      onSubscribe: ({ error }) => {
        error(new Error('boom'))
      },
    }) as any

    await signAndSend({ transaction: tx, callback, signer: dummySigner() })

    expect(calls).toHaveLength(1)
    expect(calls[0].status).toBe(TransactionStatuses.Block)
    expect(String(calls[0].error)).toContain('boom')
  })

  it('throws when signer missing', async () => {
    const tx = makeTx({}) as any
    await expect(signAndSend({ transaction: tx, callback: vi.fn(), signer: undefined as any })).rejects.toThrow(
      'Signer is required',
    )
  })
})
