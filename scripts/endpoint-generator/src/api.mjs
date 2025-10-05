import { ApiPromise, WsProvider } from '@polkadot/api'
import pTimeout from 'p-timeout'
import { PromisePool } from '@supercharge/promise-pool'
import chalk from 'chalk'

const TIMEOUT = 20000
const CONCURRENCY = 5

export async function testEndpoint(url, network, spinner) {
  const startTime = Date.now()
  let wsProvider = null
  let api = null

  try {
    wsProvider = new WsProvider(url)
    api = new ApiPromise({
      provider: wsProvider,
      noInitWarn: true,
    })

    await pTimeout(
      api.isReady,
      { milliseconds: TIMEOUT }
    )

    spinner.increaseTestedCount(network)

    return {
      network,
      url,
      responseTime: Date.now() - startTime,
      success: true,
    }
  } catch (error) {
    spinner.increaseTestedCount(network)
    spinner.warn(`${network}: Failed to connect to ${chalk.dim(url)}: ${error.message}`)
    spinner.restart()

    return { network, url, success: false }
  } finally {
    if (api?.isConnected) {
      try { await api.disconnect() } catch {}
    }

    if (wsProvider?.isConnected) {
      try { await wsProvider.disconnect() } catch {}
    }
  }
}

export async function findFastestEndpoint(providers, network, spinner) {
  const { results } = await PromisePool
    .for(providers)
    .withConcurrency(CONCURRENCY)
    .process(async (url) => testEndpoint(url, network, spinner))

  const successful = results.filter((r) => r.success)

  if (successful.length === 0) {
    spinner.warn(`No successful connections for ${chalk.bold(network)}`)
    spinner.restart()
    return { network, url: null, success: false, fallback: true }
  }

  return successful.reduce((fastest, current) =>
    !fastest || current.responseTime < fastest.responseTime ? current : fastest,
  )
}
