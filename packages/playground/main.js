import { Asset, Chain } from '@paraport/static'
import { web3Enable } from '@polkadot/extension-dapp'

import '@paraport/ui/style'
import * as paraport from '@paraport/ui'

const DAPP_NAME = 'Kodadot'
const USER_ADDRESS = 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY'
const AMOUNT = '600000000000'

const main = async () => {
  await web3Enable(DAPP_NAME)

  paraport.init({
    integratedTargetId: 'root',
    label: 'Confirm',
    autoteleport: {
  		address: USER_ADDRESS,
  		amount: AMOUNT,
  		chain: Chain.AssetHubKusama,
  		asset: Asset.KSM,
  	},
    logLevel: 'DEBUG',
    onSubmit: (autoteleport) => {
        console.log('📦 Submit button pressed')
        console.log('🚀 Autoteleport: ', autoteleport)
    },
    onCompleted: () => {
        console.log('✅ Auto-teleport successfully completed!')
    },
  })
}

main()
