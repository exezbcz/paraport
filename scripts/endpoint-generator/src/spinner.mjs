import ora from 'ora'
import chalk from 'chalk'

export class ProgressSpinner {
  constructor(initialMessage) {
    this.spinner = ora({
      text: initialMessage,
      discardStdin: false
    }).start()
    this.networkProgress = {}
    this.currentNetwork = null
  }

  get text() {
    return this.spinner.text
  }

  set text(message) {
    this.spinner.stop()
    this.spinner.start(message)
  }

  warn(message) {
    this.spinner.warn(message)
  }

  succeed(message) {
    this.spinner.succeed(message)
  }

  fail(message) {
    this.spinner.fail(message)
  }

  updateNetwork(network, totalEndpoints) {
    this.currentNetwork = network
    this.networkProgress[network] = {
      tested: 0,
      total: totalEndpoints
    }
    this.text = this.getProgressMessage()
  }

  getProgressMessage(network = this.currentNetwork) {
    if (!network) {
      return 'Testing endpoints...'
    }

    const progress = this.networkProgress[network] || { tested: 0, total: 0 }
    return `Testing ${chalk.bold(network)} endpoints... [${progress.tested}/${progress.total}]`
  }

  increaseTestedCount(network) {
    if (this.networkProgress[network]) {
      this.networkProgress[network].tested++
      this.text = this.getProgressMessage(network)
    }
  }

  restart() {
    this.text = this.getProgressMessage()
  }
}

export function setupSpinner(initialMessage) {
  return new ProgressSpinner(initialMessage)
}
