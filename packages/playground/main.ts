import '@paraport/sdk/style'
import * as paraport from '@paraport/sdk'

const USER_ADDRESS = 'CykZSc3szpVd95PmmJ45wE4ez7Vj3xkhRFS9H4U1WdrkaFY'
const AMOUNT = '600000000000'

const main = async () => {
  paraport.init({
    integratedTargetId: 'root',
    label: 'Confirm',
    autoteleport: {
  		address: USER_ADDRESS,
  		amount: AMOUNT,
  		chain: 'AssetHubKusama',
  		asset: 'KSM',
  	},
    logLevel: 'DEBUG',
    onReady: () => {
      console.log('🚀 ParaPort ready!')
    },
    onSubmit: (autoteleport) => {
        console.log('📦 Submit button pressed')
        console.log('💥 Autoteleport: ', autoteleport)
    },
    onCompleted: () => {
        console.log('✅ Auto-teleport successfully completed!')
    },
    onAddFunds: () => {
        console.log('💰 Add funds button pressed')
    },
  })
}

main()
