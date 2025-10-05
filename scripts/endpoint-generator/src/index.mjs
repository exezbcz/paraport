import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import chalk from 'chalk'
import { processAllNetworks } from './networks.mjs'
import { setupSpinner } from './spinner.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_FILE_NAME = 'endpoints.json'
const OUTPUT_DIR = path.join(__dirname, '../../../packages/static/')

// Silent handler for unhandled promise rejections from WebSocket connections
// Prevents Node.js warnings and ensures clean script completion
process.on('unhandledRejection', () => {})

const spinner = setupSpinner('Preparing to test endpoints...')

processAllNetworks(spinner)
  .then((results) => {
    spinner.text = 'Processing results...'
    const endpointsData = {}

    for (const [key, result] of results) {
      if (!result?.url) {
        spinner.warn(`No working endpoint found for ${chalk.bold(key)}, using empty value`)
        spinner.text = 'Processing results...'
      }

      endpointsData[key] = {
        endpoint: result?.url || null,
        providers: result.providers || [],
        responseTime: result?.responseTime,
        fallback: result?.fallback || false,
      }
    }

    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    fs.writeFileSync(
      path.join(OUTPUT_DIR, OUTPUT_FILE_NAME),
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
    console.error(error)
  })
  .finally(() => process.exit(0))
