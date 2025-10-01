import '@paraport/sdk/style'
import * as paraport from '@paraport/sdk'
import { USER_ADDRESS, AMOUNT } from '../constants'

const main = async () => {
  paraport.init({
    integratedTargetId: 'root',
    label: 'Mint',
    autoteleport: {
  		address: USER_ADDRESS,
  		amount: AMOUNT,
  		chain: 'AssetHubKusama',
  		asset: 'KSM',
  	},
    logLevel: 'DEBUG',
    onReady: (session) => {
      console.log('🚀 ParaPort ready!', session)
    },
    onSubmit: ({ autoteleport, completed }) => {
        console.log('📦 Submit button pressed')
        console.log('💥 Autoteleport: ', autoteleport)
        console.log('✅ Completed: ', completed)
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