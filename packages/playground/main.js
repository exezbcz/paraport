import { AutoTeleportSDK } from '@autoteleport/core'

const main = async () => {
  const autoteleport = new AutoTeleportSDK({
    chains: ['Polkadot', 'AssetHubPolkadot'],
  })

  console.log('AutoTeleportSDK', autoteleport)

  await autoteleport.initialize()

  const quotes = await autoteleport.getQuotes({
    address: 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY',
    amount: '1000000000000',
    sourceChain: 'Polkadot',
    asset: 'DOT',
    actions: [
      {
        section: 'balances',
        method: 'transferAllowDeath',
        args: [
          'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY',
          '1000000000000',
        ]
      },
    ]
  })

  console.log('Quotes', quotes)
}

main()
