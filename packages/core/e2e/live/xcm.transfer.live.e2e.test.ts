import { describe, expect, it } from 'vitest'
import { Chains, Assets, type Chain, type Asset } from '@paraport/static'
import type { SDKConfig } from '@/types/common'
import { LogLevels } from '@/types/sdk'
import { TeleportEventTypes } from '@/types/teleport'

// Gate live tests behind an explicit opt-in
const E2E_ENABLED = process.env.E2E_LIVE === '1'
const maybeDescribe = E2E_ENABLED ? describe.sequential : describe.skip

// Parse env helpers
const allChains = Object.values(Chains) as ReadonlyArray<Chain>

const parseChainEnv = (value?: string): Chain => {
  if (!value || !(allChains as ReadonlyArray<string>).includes(value)) {
    throw new Error('E2E_CHAIN is required and must be a valid chain name')
  }
  return value as Chain
}

const CHAIN: Chain = parseChainEnv(process.env.E2E_CHAIN)
const ASSET: Asset = Assets.PAS

let ADDRESS = process.env.E2E_ADDRESS || ''
const MNEMONIC = process.env.E2E_MNEMONIC || ''

// sr25519 signer from mnemonic
async function makeSr25519SignerFromMnemonic(mnemonic: string) {
  const { cryptoWaitReady, mnemonicToMiniSecret, sr25519PairFromSeed, sr25519Sign } = await import('@polkadot/util-crypto')
  const { getPolkadotSigner } = await import('polkadot-api/signer')
  await cryptoWaitReady()
  const seed = mnemonicToMiniSecret(mnemonic)
  const pair = sr25519PairFromSeed(seed)
  return getPolkadotSigner(pair.publicKey, 'Sr25519', (input: Uint8Array) => sr25519Sign(input, pair))
}

maybeDescribe('LIVE: XCM Auto Top-up', () => {
  it('tops up the specified chain when feasible', async () => {
    // Derive an address (ss58 of DEST) if not provided
    if (!ADDRESS && MNEMONIC) {
      const { cryptoWaitReady, mnemonicToMiniSecret, sr25519PairFromSeed } = await import('@polkadot/util-crypto')
      const { encodeAddress } = await import('dedot/utils')
      await cryptoWaitReady()
      const seed = mnemonicToMiniSecret(MNEMONIC)
      const { publicKey } = sr25519PairFromSeed(seed)
      const { ss58Of } = await import('@/utils/chains')
      ADDRESS = encodeAddress(publicKey, ss58Of(CHAIN))
    }

    if (!ADDRESS) throw new Error('E2E_ADDRESS or E2E_MNEMONIC is required')

    const { default: ParaPortSDK } = await import('@/sdk/ParaPortSDK')
    const { default: BalanceService } = await import('@/services/BalanceService')
    const { Logger } = await import('@/services/LoggerService')

    const config: SDKConfig = {
      getSigner: async () => {
        if (!MNEMONIC) throw new Error('E2E_MNEMONIC is required for signing')
        return makeSr25519SignerFromMnemonic(MNEMONIC)
      },
      bridgeProtocols: ['XCM'],
      chains: [ Chains.CoretimePaseo, Chains.AssetHubPaseo ],
    }

    const sdk = new ParaPortSDK(config as any)
    const { default: PolkadotApiCls } = await import('@/services/PolkadotApi')
    const papi = new PolkadotApiCls(config)
    const logger = new Logger({ minLevel: LogLevels.INFO })
    const balancesSvc = new BalanceService(papi, logger)

    await sdk.initialize()

    // 1) Read balance on the destination chain
    const [currentChainBalance] = await balancesSvc.getBalances({ address: ADDRESS, asset: ASSET, chains: [CHAIN] })
    const balance = currentChainBalance?.transferable ?? 0n

    // 2) Request a minimal top-up: desired = current + 0.5 PAS
    const desired = balance + 5000000000n

    const sessionToExecute = await sdk.initSession({
      address: ADDRESS,
      amount: String(desired),
      chain: CHAIN,
      asset: ASSET,
    })

    expect(sessionToExecute.funds.available).toBeTruthy()
    expect(sessionToExecute.quotes.selected).toBeDefined()

    // 3) Execute and assert dest balance increases
    await sdk.executeSession(sessionToExecute.id)

    // 4) Wait and check balance to increases
    await new Promise((resolve) => {
      sdk.onTeleport(TeleportEventTypes.TELEPORT_COMPLETED, () => {
        resolve(true)
      })
    })

    const [after] = await balancesSvc.getBalances({ address: ADDRESS, asset: ASSET, chains: [CHAIN] })
    expect(after.transferable > balance).toBe(true)
    expect(after.transferable > desired).toBe(true)
  }, 180_000)
})
