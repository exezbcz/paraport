import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ApiPromise, WsProvider } from '@polkadot/api'
import {
	prodParasKusamaCommon,
	prodParasPolkadot,
	prodParasPolkadotCommon,
} from '@polkadot/apps-config'
import ora from 'ora'
import chalk from 'chalk'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const TIMEOUT = 20000
const OUTPUT_FILE_NAME = 'endpoints.json'

let testedCount = 0
let totalEndpoints = 0
let spinner

const getProgressMessage = () => {
  return `Testing endpoints... [${testedCount}/${totalEndpoints}]`
}

const restartSpinner = (text = null) => {
  const message = text || getProgressMessage()
  spinner = ora(message).start()
  return spinner
}

const increaseTestedCount = () => {
  testedCount++
  spinner.text = getProgressMessage()
}

const findChainById = (config, name) => {
	const hub = config.find((key) => key.info === name)
	return Object.values(hub?.providers || {})
}

async function testEndpoint(url, network) {
	const startTime = Date.now()
	const wsProvider = new WsProvider(url)
	const api = new ApiPromise({ provider: wsProvider, noInitWarn: true })

	try {
		await Promise.race([
			api.isReady,
			new Promise((_, reject) =>
				setTimeout(() => reject(new Error('Timeout')), TIMEOUT),
			),
		])

		increaseTestedCount()

		return {
			network,
			url,
			responseTime: Date.now() - startTime,
			success: true,
		}
	} catch (error) {
		increaseTestedCount()
		spinner.warn(`${network}: Failed to connect to ${chalk.dim(url)}: ${error.message}`)
		restartSpinner()

		return { network, url, success: false }
	} finally {
		if (api) api.disconnect()
		if (wsProvider) wsProvider.disconnect()
	}
}

async function findFastestEndpoint(providers, network) {
	const results = await Promise.all(
		providers.map((url) => testEndpoint(url, network)),
	)
	const successful = results.filter((r) => r.success)

	if (successful.length === 0) {
		spinner.warn(`No successful connections for ${chalk.bold(network)}`)
		restartSpinner()
		return { network, url: null, success: false, fallback: true }
	}

	return successful.reduce((fastest, current) =>
		!fastest || current.responseTime < fastest.responseTime ? current : fastest,
	)
}

const networkMap = {
	AssetHubPolkadot: {
		providers: findChainById(prodParasPolkadotCommon, 'PolkadotAssetHub'),
	},
	AssetHubKusama: {
		providers: findChainById(prodParasKusamaCommon, 'KusamaAssetHub'),
	},
	Hydration: {
		providers: findChainById(prodParasPolkadot, 'hydradx'),
	},
}

totalEndpoints = Object.values(networkMap).reduce(
  (sum, { providers }) => sum + providers.length, 0
)

spinner = ora(getProgressMessage()).start()

Promise.all(
	Object.entries(networkMap).map(([network, { providers }]) =>
		findFastestEndpoint(providers, network).then((result) => [network, result]),
	),
)
	.then((results) => {
		const endpointsData = {}

		for (const [key, result] of results) {
			if (!result?.url) {
				spinner.warn(`No working endpoint found for ${chalk.bold(key)}, using empty value`)
				restartSpinner('Processing results...')
			}

			endpointsData[key] = {
				endpoint: result?.url || null,
				providers: networkMap[key].providers || [],
				responseTime: result?.responseTime,
				fallback: result?.fallback || false,
			}
		}

		const dir = path.join(__dirname, '../../packages/static/')

		fs.mkdirSync(dir, { recursive: true })
		fs.writeFileSync(
			path.join(dir, OUTPUT_FILE_NAME),
			JSON.stringify(endpointsData, null, 2),
		)

		console.log('\n')
		spinner.succeed(`${chalk.green('Endpoints data written successfully')}`)
		console.log('\n' + chalk.bold('Fastest providers:'))

		for (const [network, data] of Object.entries(endpointsData)) {
			const endpoint = data.endpoint || 'None found'
			const responseTime = data.responseTime
				? chalk.gray(`(${data.responseTime}ms)`)
				: ''

			console.log(`${chalk.cyan('•')} ${chalk.bold(network)}: ${endpoint} ${responseTime}`)
		}
	})
	.catch((error) => {
		spinner.fail(`${chalk.red('Error:')} ${error.message}`)
	})
	.finally(() => process.exit(0))
