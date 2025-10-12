import { beforeEach, describe, expect, it, vi } from 'vitest'
import ParaPortSDK from '@/sdk/ParaPortSDK'
import XCMBridge from '@/bridges/xcm/XCMBridge'
import { Assets, Chains } from '@paraport/static'
import { SUBSTRATE_ADDRESS } from '@/__tests__/utils/constants'
import BalanceService from '@/services/BalanceService'
import { dummySigner } from '@/__tests__/utils/test-helpers'

// Stub XCMBridge to avoid network and control getQuote behavior
vi.mock('@/bridges/xcm/XCMBridge', () => {
  return {
    default: class XCMBridgeStub {
      protocol = 'XCM' as const
      constructor(..._args: unknown[]) {}
      async initialize() {}
      async getQuote() {
        return {
          route: { origin: Chains.Kusama, destination: Chains.AssetHubKusama, protocol: 'XCM' as const },
          fees: { bridge: 1n, total: 1n },
          amount: 99n,
          total: 100n,
          asset: Assets.KSM,
          execution: { requiredSignatureCount: 1, timeMs: 0 },
          teleportMode: 'Expected',
        }
      }
      async transfer() { return () => {} }
    },
  }
})

describe('ParaPortSDK calculateTeleport scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('when user has enough balance: teleport is not needed', async () => {
    vi.spyOn(BalanceService.prototype, 'hasEnoughBalance').mockResolvedValue(true)
    vi.spyOn(BalanceService.prototype, 'subscribeBalances').mockResolvedValue(() => {})

    const sdk = new ParaPortSDK({
      chains: [Chains.Kusama, Chains.AssetHubKusama],
      bridgeProtocols: ['XCM'],
      getSigner: async () => dummySigner(),
    } as any)

    await sdk.initialize()

    const session = await sdk.initSession({
      address: SUBSTRATE_ADDRESS,
      amount: '100',
      asset: Assets.KSM,
      chain: Chains.AssetHubKusama,
    })

    // teleport not needed
    expect(session.funds.needed).toBe(false)
    expect(session.funds.available).toBe(false)
    expect(session.funds.noFundsAtAll).toBe(false)
    expect(session.quotes.available).toHaveLength(0)
    expect(session.quotes.selected).toBeUndefined()
    expect(session.quotes.bestQuote).toBeUndefined()
  })

  it('when user lacks balance: teleport is needed and quotes are available', async () => {
    vi.spyOn(BalanceService.prototype, 'hasEnoughBalance').mockResolvedValue(false)
    vi.spyOn(BalanceService.prototype, 'subscribeBalances').mockResolvedValue(() => {})

    const sdk = new ParaPortSDK({
      chains: [Chains.Kusama, Chains.AssetHubKusama],
      bridgeProtocols: ['XCM'],
      getSigner: async () => dummySigner(),
    } as any)

    await sdk.initialize()

    const session = await sdk.initSession({
      address: SUBSTRATE_ADDRESS,
      amount: '100',
      asset: Assets.KSM,
      chain: Chains.AssetHubKusama,
    })

    expect(session.funds.needed).toBe(true)
    expect(session.funds.available).toBe(true)
    expect(session.funds.noFundsAtAll).toBe(false)
    expect(session.quotes.available.length).toBeGreaterThan(0)
    expect(session.quotes.selected).toBeDefined()
    expect(session.quotes.bestQuote).toEqual(session.quotes.selected)
  })

  it('when user lacks balance and no bridges provide quotes: noFundsAtAll', async () => {
    // Force no quotes from registered bridge
    vi.spyOn(BalanceService.prototype, 'hasEnoughBalance').mockResolvedValue(false)
    vi.spyOn(BalanceService.prototype, 'subscribeBalances').mockResolvedValue(() => {})
    vi.spyOn(XCMBridge.prototype, 'getQuote').mockResolvedValue(null)

    const sdk = new ParaPortSDK({
      chains: [Chains.Kusama, Chains.AssetHubKusama],
      bridgeProtocols: ['XCM'],
      getSigner: async () => dummySigner(),
    } as any)

    await sdk.initialize()

    const session = await sdk.initSession({
      address: SUBSTRATE_ADDRESS,
      amount: '100',
      asset: Assets.KSM,
      chain: Chains.AssetHubKusama,
    })

    expect(session.funds.needed).toBe(true)
    expect(session.funds.available).toBe(false)
    expect(session.funds.noFundsAtAll).toBe(true)
    expect(session.quotes.available).toHaveLength(0)
    expect(session.quotes.selected).toBeUndefined()
    expect(session.quotes.bestQuote).toBeUndefined()
  })
})
