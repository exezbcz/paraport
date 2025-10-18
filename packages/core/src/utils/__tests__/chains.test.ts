import { describe, expect, it, vi } from 'vitest'

vi.mock('@paraport/static', () => ({
  // Minimal chain props for tests
  CHAINS: {
    Polkadot: { ss58Format: 0, tokenDecimals: 10, blockExplorer: 'https://polkadot.subscan.io' },
  },
  CHAIN_NAMES: { Polkadot: 'Polkadot', AssetHubPolkadot: 'AssetHubPolkadot' },
  Chains: { Polkadot: 'Polkadot', AssetHubPolkadot: 'AssetHubPolkadot' },
}))

vi.mock('@paraspell/sdk', () => ({
  SUBSTRATE_CHAINS: ['Polkadot', 'AssetHubPolkadot', 'UnknownChain'],
}))

vi.mock('@/utils/assets', () => ({
  isAssetSupported: (_origin: string, destination: string, asset: string) => {
    // Only AssetHubPolkadot supports DOT in this mock
    return asset === 'DOT' && destination === 'AssetHubPolkadot'
  },
}))

import { chainPropListOf, getChainName, blockExplorerOf, getRouteChains } from '@/utils/chains'

describe('chains utils', () => {
  it('chainPropListOf and helpers', () => {
    const props = chainPropListOf('Polkadot')
    expect(props.ss58Format).toBe(0)
    expect(props.tokenDecimals).toBe(10)
    expect(getChainName('Polkadot')).toBe('Polkadot')
    expect(blockExplorerOf('Polkadot')).toContain('subscan')
  })

  it('getRouteChains returns origin plus supported destinations filtered to Chains', () => {
    const route = getRouteChains('Polkadot', 'DOT')
    expect(route).toEqual(['Polkadot', 'AssetHubPolkadot'])
  })
})
