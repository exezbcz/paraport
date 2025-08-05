import { AutoTeleportSDK, Asset, Chain } from '@autoteleport/core'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

import '@autoteleport/ui/style'
import { mount } from '@autoteleport/ui'

const DAPP_NAME = 'Kodadot'
const USER_ADDRESS = 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY'

const main = async () => {

  mount({
    target: '#root',
    sdk: new AutoTeleportSDK({
      getSigner: async () => {
        await web3Enable(DAPP_NAME)

        const injector = await web3FromAddress(USER_ADDRESS)

        return injector.signer
      }
    }),
    onSubmit: (autoteleport) => {
        console.log('is auto-teleporting', autoteleport)
    },
    onCompleted: () => {
        console.log('auto-teleport completed')
    },
    label: 'Confirm',
    autoteleport: {
  		address: USER_ADDRESS,
  		amount: '1000000',
  		sourceChain: Chain.KUSAMA,
  		chain: Chain.KUSAMA,
  		asset: Asset.KSM,
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
