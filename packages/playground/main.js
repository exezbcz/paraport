import { AutoTeleportSDK, Asset, Chain } from '@autoteleport/core'

import '@autoteleport/ui/style'
import { mount } from '@autoteleport/ui'

const main = async () => {

  mount({
    target: '#root',
    sdk: new AutoTeleportSDK({
      chains: [
        Chain.POLKADOT,
        Chain.ASSETHUBPOLKADOT
      ],
    }),
    autoteleport: {
  		address: 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY',
  		amount: '1000000000000',
  		sourceChain: Chain.POLKADOT,
  		asset: Asset.DOT,
  		actions: [
  			{
  				section: 'balances',
  				method: 'transferAllowDeath',
  				args: [
  					'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY',
  					'1000000000000',
  				],
  			},
  		],
  	}
  })

}

main()
