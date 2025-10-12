import { beforeEach, describe, expect, it, vi } from 'vitest'
import ParaPortSDK from '@/sdk/ParaPortSDK'
import { Chains } from '@paraport/static'
import { dummySigner } from '@/__tests__/utils/test-helpers'
import SessionManager from '@/managers/SessionManager'
import { TeleportManager } from '@/managers/TeleportManager'
import PolkadotApi from '@/services/PolkadotApi'

// Provide a lightweight XCMBridge to avoid any network
vi.mock('@/bridges/xcm/XCMBridge', () => ({
  default: class XCMBridgeStub { protocol = 'XCM' as const; async initialize() {} }
}))

describe('ParaPortSDK.destroy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls sessionManager.destroy, teleportManager.destroy, papi.closeAll and runs unsubs', async () => {
    const sessionDestroySpy = vi.spyOn(SessionManager.prototype, 'destroy')
    const teleportDestroySpy = vi.spyOn(TeleportManager.prototype, 'destroy')
    const closeAllSpy = vi.spyOn(PolkadotApi.prototype, 'closeAll')

    // Make subscribe return two distinct unsubscribe callbacks so SDK registers them
    const unsub1 = vi.fn()
    const unsub2 = vi.fn()
    const subscribeSpy = vi
      .spyOn(TeleportManager.prototype, 'subscribe')
      .mockImplementationOnce((_t: any, _cb: any) => unsub1)
      .mockImplementationOnce((_t: any, _cb: any) => unsub2)

    const sdk = new ParaPortSDK({
      chains: [Chains.Kusama, Chains.AssetHubKusama],
      bridgeProtocols: ['XCM'],
      getSigner: async () => dummySigner(),
    } as any)

    await sdk.initialize()
    expect(subscribeSpy).toHaveBeenCalled()

    sdk.destroy()

    expect(unsub1).toHaveBeenCalledTimes(1)
    expect(unsub2).toHaveBeenCalledTimes(1)
    expect(sessionDestroySpy).toHaveBeenCalledTimes(1)
    expect(teleportDestroySpy).toHaveBeenCalledTimes(1)
    expect(closeAllSpy).toHaveBeenCalledTimes(1)
  })
})
