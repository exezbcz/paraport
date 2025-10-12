import { connectInjectedExtension } from 'polkadot-api/pjs-signer'
import { type ParaportParams } from '@paraport/vue'

export const USER_ADDRESS = 'Gn84LKb5HSxc3SACayxCzKQcWESRMcT1VUCqeZURfGj6ASi'
export const AMOUNT = String(250e8)
export const CHAIN = 'AssetHubPolkadot' as ParaportParams['chain']
export const ASSET = 'DOT' as ParaportParams['asset']

export const ENDPOINTS = {
  'AssetHubPolkadot': ["wss://statemint.api.onfinality.io/public-ws","wss://asset-hub-polkadot.dotters.network"],
  'Polkadot': ["wss://polkadot-public-rpc.blockops.network/ws","wss://polkadot-rpc.publicnode.com"],
  "Hydration": ["wss://hydration-rpc.n.dwellir.com","wss://rpc.hydradx.cloud","wss://hydration.dotters.network"]
} as ParaportParams['endpoints']

export const getSigner = async () => {
  const inject = await connectInjectedExtension('talisman', 'Chaotic')
  const account = inject.getAccounts().find((account) => account.address === USER_ADDRESS)
  return account!.polkadotSigner
}
