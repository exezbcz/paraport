import { describe, expect, it, vi } from 'vitest'
import SessionManager from '@/managers/SessionManager'
import { GenericEmitter } from '@/base/GenericEmitter'
import { SUBSTRATE_ADDRESS } from '@/__tests__/utils/constants'
import { Assets, Chains } from '@paraport/static'
import { TeleportSessionStatuses } from '@/types/sdk'

const params = {
  address: SUBSTRATE_ADDRESS,
  chain: Chains.Kusama,
  amount: 100n,
  asset: Assets.KSM,
}

describe('SessionManager cleanup', () => {
  it('removeSession calls unsubscribe and removes item', () => {
    const emitter = new GenericEmitter()
    const sm = new SessionManager(emitter)
    const unsub = vi.fn()

    const id = sm.createSession(params as any, {
      status: TeleportSessionStatuses.Ready,
      unsubscribe: unsub,
    })

    expect(sm.getItem(id)).toBeDefined()

    sm.removeSession(id)

    expect(unsub).toHaveBeenCalledTimes(1)
    expect(sm.getItem(id)).toBeUndefined()
  })

  it('destroy calls unsubscribe for all sessions and clears items and listeners', () => {
    const emitter = new GenericEmitter()
    const sm = new SessionManager(emitter)
    const unsub1 = vi.fn()
    const unsub2 = vi.fn()

    // Override global uuid stub to generate two distinct ids for this test
    vi.spyOn(crypto, 'randomUUID')
      .mockImplementationOnce(() => 'session-1' as any)
      .mockImplementationOnce(() => 'session-2' as any)

    sm.createSession(params as any, { status: TeleportSessionStatuses.Ready, unsubscribe: unsub1 })
    sm.createSession(params as any, { status: TeleportSessionStatuses.Ready, unsubscribe: unsub2 })

    const spyRemoveAll = vi.spyOn(emitter, 'removeAllListeners')

    // Ensure sessions carry our unsubscribe functions
    const unsubs = sm.getAllItems().map((s) => s.unsubscribe)
    expect(unsubs.length).toBe(2)
    expect(unsubs).toEqual(expect.arrayContaining([unsub1, unsub2]))

    sm.destroy()

    expect(unsub1).toHaveBeenCalledTimes(1)
    expect(unsub2).toHaveBeenCalledTimes(1)
    expect(sm.getAllItems()).toHaveLength(0)
    expect(spyRemoveAll).toHaveBeenCalled()
  })
})
