import { Assets, Chains } from '@paraport/static'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ParaPortSDK from '../../sdk/ParaPortSDK'
import type { SDKConfig } from '../../types/common'
import { TeleportParams } from '../../types/teleport'
import { SUBSTRATE_ADDRESS } from '../utils/constants'

vi.mock('@polkadot/util-crypto', () => ({
  decodeAddress: vi.fn((address: string) => {
    if (address === 'invalid-address') {
      throw new Error('Invalid address format')
    }
    return new Uint8Array(32)
  }),
  encodeAddress: vi.fn(),
}))

describe('ParaPortSDK', () => {
	let sdk: ParaPortSDK
	const mockConfig: SDKConfig<false> = {
		chains: [Chains.Kusama, Chains.AssetHubKusama],
		bridgeProtocols: ['XCM'],
	}

	beforeEach(() => {
		sdk = new ParaPortSDK(mockConfig)
	})

	describe('initialization', () => {
		it('should initialize successfully with valid config', async () => {
			await expect(sdk.initialize()).resolves.not.toThrow()
		}, 20000)

		it('should throw error when initializing twice', async () => {
			await sdk.initialize()
			await expect(sdk.initialize()).rejects.toThrow('SDK already initialized')
		}, 20000)
	})

	describe('validateTeleportParams', () => {
	  const validParams: TeleportParams<string> = {
	    address: SUBSTRATE_ADDRESS,
	    amount: '1000000000000',
	    asset: Assets.KSM,
	    chain: Chains.AssetHubKusama
	  }

	  it('should not throw for valid params', () => {
	    expect(() => {
	      // @ts-ignore - accessing private method for testing
	      sdk.validateTeleportParams(validParams)
	    }).not.toThrow()
	  })

	  it('should throw for invalid address', () => {
	    const invalidParams = { ...validParams, address: 'invalid-address' }
	    expect(() => {
	      // @ts-ignore - accessing private method for testing
	      sdk.validateTeleportParams(invalidParams)
	    }).toThrow('Invalid address format')
	  })

	  it('should throw for invalid amount', () => {
	    const invalidParams = { ...validParams, amount: '0' }
	    expect(() => {
	      // @ts-ignore - accessing private method for testing
	      sdk.validateTeleportParams(invalidParams)
	    }).toThrow('Amount must be greater than 0')
	  })

	  it('should throw for invalid asset', () => {
	    const invalidParams = { ...validParams, asset: 'INVALID' as any }
	    expect(() => {
	      // @ts-ignore - accessing private method for testing
	      sdk.validateTeleportParams(invalidParams)
	    }).toThrow('Invalid asset')
	  })
	})
})
