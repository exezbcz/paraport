import { AutoTeleportSDK } from '@autoteleport/core'
import { mount } from '@autoteleport/ui'

const main = async () => {

  mount({ 
    target: '#root',
    sdk: new AutoTeleportSDK({
      chains: ['Polkadot', 'AssetHubPolkadot'],
    })
  })
  
}

main()

