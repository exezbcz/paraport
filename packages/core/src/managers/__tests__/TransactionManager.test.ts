import { describe, expect, it, vi } from 'vitest'
import { TransactionManager } from '@/managers/TransactionManager'
import { GenericEmitter } from '@/base/GenericEmitter'
import { TransactionStatuses, TransactionTypes } from '@/types/transactions'
import { SUBSTRATE_ADDRESS } from '@/__tests__/utils/constants'
import { Chains, Assets } from '@paraport/static'

describe('TransactionManager', () => {
  it('createTransaction and getTelportTransactions filter correctly', () => {
    const tm = new TransactionManager(new GenericEmitter())
    const tx = tm.createTransaction({
      id: 't1',
      chain: Chains.Kusama,
      teleportId: 'tp1',
      type: TransactionTypes.Teleport,
      details: { amount: 1n, from: Chains.Kusama, to: Chains.AssetHubKusama, address: SUBSTRATE_ADDRESS, asset: Assets.KSM },
      order: 0,
    })
    expect(tx.id).toBe('t1')
    const list = tm.getTelportTransactions('tp1')
    expect(list).toHaveLength(1)
    expect(list[0].id).toBe('t1')
  })

  it('resetTransaction clears error, succeeded, hash and unsubscribe', () => {
    const tm = new TransactionManager(new GenericEmitter())
    const tx = tm.createTransaction({
      id: 't1', chain: Chains.Kusama, teleportId: 'tp1', type: TransactionTypes.Teleport,
      details: { amount: 1n, from: Chains.Kusama, to: Chains.AssetHubKusama, address: SUBSTRATE_ADDRESS, asset: Assets.KSM }, order: 0,
    })
    const unsub = vi.fn()
    tm.updateStatus('t1', TransactionStatuses.Block, { error: 'boom', succeeded: false, txHash: '0xabc', unsubscribe: unsub } as any)
    expect(tm.getItem('t1')?.error).toBe('boom')
    expect(tm.getItem('t1')?.unsubscribe).toBe(unsub)

    tm.resetTransaction(tx)
    const after = tm.getItem('t1')!
    expect(after.error).toBeUndefined()
    expect(after.succeeded).toBeUndefined()
    expect(after.txHash).toBeUndefined()
    expect(after.unsubscribe).toBeUndefined()
    expect(after.status).toBe(TransactionStatuses.Unknown)
  })

  it('destroy unsubscribes and clears items and listeners', () => {
    const emitter = new GenericEmitter()
    const tm = new TransactionManager(emitter)
    const unsub = vi.fn()
    tm.createTransaction({ id: 't1', chain: Chains.Kusama, teleportId: 'tp1', type: TransactionTypes.Teleport, details: { amount: 1n, from: Chains.Kusama, to: Chains.AssetHubKusama, address: SUBSTRATE_ADDRESS, asset: Assets.KSM }, order: 0 })
    tm.updateStatus('t1', TransactionStatuses.Block, { unsubscribe: unsub } as any)

    const spy = vi.spyOn(emitter as any, 'removeAllListeners')

    tm.destroy()
    expect(unsub).toHaveBeenCalled()
    expect(tm.getAllItems()).toHaveLength(0)
    expect(spy).toHaveBeenCalled()
  })
})
