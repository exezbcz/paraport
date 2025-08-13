import { Asset, Chain } from '@paraport/core'
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

import '@paraport/ui/style'
import * as paraport from '@paraport/ui'

const DAPP_NAME = 'Kodadot'
const USER_ADDRESS = 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY'
const AMOUNT = '600000000000'

const main = async () => {

  paraport.init({
    integratedTargetId: 'root',
    getSigner: async () => {
      await web3Enable(DAPP_NAME)

      const injector = await web3FromAddress(USER_ADDRESS)

      return injector.signer
    },
    label: 'Confirm',
    autoteleport: {
  		address: USER_ADDRESS,
  		amount: AMOUNT,
  		chain: Chain.KUSAMA,
  		asset: Asset.KSM,
  	},
   onSubmit: (autoteleport) => {
       console.log('is auto-teleporting', autoteleport)
   },
   onCompleted: () => {
       console.log('auto-teleport completed')
   },
  })

}

main()
