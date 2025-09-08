import {
  prodParasKusamaCommon,
  prodParasPolkadot,
  prodParasPolkadotCommon,
} from '@polkadot/apps-config'
import { ALTERNATIVE_ENDPOINT_MAP, ENDPOINT_MAP } from '@kodadot1/static'
import { unique } from './utils.mjs'
import { findFastestEndpoint } from './api.mjs'
import chalk from 'chalk'

const findChainById = (config, name) => {
  const hub = config.find((key) => key.info === name)
  return Object.values(hub?.providers || {})
}

export const getNetworkMap = () => ({
  AssetHubPolkadot: {
    providers: unique([
      ...findChainById(prodParasPolkadotCommon, 'PolkadotAssetHub'),
      ...ALTERNATIVE_ENDPOINT_MAP['ahp'],
      ENDPOINT_MAP['ahp'],
    ]),
  },
  AssetHubKusama: {
    providers: unique([
      ...findChainById(prodParasKusamaCommon, 'KusamaAssetHub'),
      ...ALTERNATIVE_ENDPOINT_MAP['ahk'],
      ENDPOINT_MAP['ahk'],
    ]),
  },
  Hydration: {
    providers: findChainById(prodParasPolkadot, 'hydradx'),
  },
})

export async function processAllNetworks(spinner) {
  const networkMap = getNetworkMap()
  const results = []

  for (const [network, { providers }] of Object.entries(networkMap)) {
    if (!providers || providers.length === 0) {
      spinner.warn(`No providers found for ${chalk.bold(network)}`)
      results.push([network, { network, url: null, success: false, fallback: true, providers: [] }])
      continue
    }

    spinner.updateNetwork(network, providers.length)
    const result = await findFastestEndpoint(providers, network, spinner)
    results.push([network, { ...result, providers }])
  }

  return results
}
