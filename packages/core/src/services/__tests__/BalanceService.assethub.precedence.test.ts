import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SUBSTRATE_ADDRESS } from '@/__tests__/utils/constants'
import { Chains, type Chain, Assets } from '@paraport/static'

// Keep address formatting and transferable calculation simple for unit tests
vi.mock('@/utils', () => ({
  formatAddress: vi.fn((a: string) => a),
  transferableBalanceOf: vi.fn((amount: bigint) => amount),
}))

// Hoisted mock for assets util; tests mutate `mockAssetInfo` per case
let mockAssetInfo: any = {}
vi.mock('@/utils/assets', () => ({
  getAssetInfoOrThrow: vi.fn((_c: Chain, _a: any) => mockAssetInfo),
}))

import BalanceService from '@/services/BalanceService'

describe('BalanceService.getBalance precedence on AssetHub chains', () => {
  beforeEach(() => vi.clearAllMocks())

  it('prefers ForeignAssets (by location) over Assets (by assetId) when both exist', async () => {
    // Mock asset info: non-native, with both location and assetId
    mockAssetInfo = {
      isNative: false,
      location: { parents: 1, interior: { Here: null } },
      assetId: 1234,
    }

    // Typed API for AssetHubPolkadot
    const papi = {
      getInstance: (chain: Chain) => {
        if (chain !== Chains.AssetHubPolkadot) throw new Error('unexpected chain')
        return {
          api: {
            query: {
              ForeignAssets: {
                Account: {
                  getValue: vi.fn(async () => ({ balance: 200n })),
                },
              },
              Assets: {
                Account: {
                  getValue: vi.fn(async () => ({ balance: 999n })),
                },
              },
            },
          },
        }
      },
    } as any

    const svc = new BalanceService(papi, { debug: vi.fn(), error: vi.fn() } as any)
    const res = await svc.getBalances({ address: SUBSTRATE_ADDRESS, asset: Assets.USDT, chains: [Chains.AssetHubPolkadot] })

    expect(res).toHaveLength(1)
    expect(res[0].chain).toBe(Chains.AssetHubPolkadot)
    // Ensures location read wins and Assets path is not used to overwrite
    expect(res[0].amount).toBe(200n)
  })

  it('uses Assets (by assetId) when location is not present', async () => {
    // Mock asset info: non-native, assetId only
    mockAssetInfo = {
      isNative: false,
      assetId: 5678,
    }

    const papi = {
      getInstance: (chain: Chain) => {
        if (chain !== Chains.AssetHubKusama) throw new Error('unexpected chain')
        return {
          api: {
            query: {
              Assets: {
                Account: {
                  getValue: vi.fn(async () => ({ balance: 321n })),
                },
              },
              System: {
                Account: { getValue: vi.fn(async () => ({ data: { free: 0n } })) },
              },
            },
          },
        }
      },
    } as any

    const svc = new BalanceService(papi, { debug: vi.fn(), error: vi.fn() } as any)
    const res = await svc.getBalances({ address: SUBSTRATE_ADDRESS, asset: Assets.USDT, chains: [Chains.AssetHubKusama] })

    expect(res).toHaveLength(1)
    expect(res[0].chain).toBe(Chains.AssetHubKusama)
    expect(res[0].amount).toBe(321n)
  })
})
