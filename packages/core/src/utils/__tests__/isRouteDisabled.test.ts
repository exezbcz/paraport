import { describe, expect, it, vi } from 'vitest'

vi.mock('@paraport/static', () => ({
  CHAINS: {
    Polkadot: { ss58Format: 0, tokenDecimals: 10, blockExplorer: 'https://polkadot.subscan.io' },
    AssetHubPolkadot: { ss58Format: 0, tokenDecimals: 10, blockExplorer: 'https://assethub-polkadot.subscan.io' },
    AssetHubKusama: { ss58Format: 2, tokenDecimals: 12, blockExplorer: 'https://assethub-kusama.subscan.io' },
  },
  CHAIN_NAMES: {
    Polkadot: 'Polkadot',
    AssetHubPolkadot: 'AssetHubPolkadot',
    AssetHubKusama: 'AssetHubKusama',
  },
  Chains: {
    Polkadot: 'Polkadot',
    AssetHubPolkadot: 'AssetHubPolkadot',
    AssetHubKusama: 'AssetHubKusama',
  },
}))

vi.mock('@paraspell/sdk', () => ({
  SUBSTRATE_CHAINS: ['Polkadot', 'AssetHubPolkadot', 'AssetHubKusama'],
}))

vi.mock('@/utils/assets', () => ({
  isAssetSupported: () => true,
}))

import { getRouteChains, isRouteDisabled } from '@/utils/chains'

describe('isRouteDisabled', () => {
  it('disables AssetHubKusama -> AssetHubPolkadot', () => {
    expect(isRouteDisabled('AssetHubKusama' as any, 'AssetHubPolkadot' as any)).toBe(true)
  })

  it('disables AssetHubPolkadot -> AssetHubKusama', () => {
    expect(isRouteDisabled('AssetHubPolkadot' as any, 'AssetHubKusama' as any)).toBe(true)
  })

  it('does not disable unrelated routes', () => {
    expect(isRouteDisabled('Polkadot' as any, 'AssetHubPolkadot' as any)).toBe(false)
  })
})

describe('getRouteChains respects disabled routes', () => {
  it('excludes AssetHubKusama origin when destination is AssetHubPolkadot', () => {
    const route = getRouteChains('AssetHubPolkadot' as any, 'DOT' as any)
    expect(route).toEqual(['AssetHubPolkadot', 'Polkadot'])
  })
})
