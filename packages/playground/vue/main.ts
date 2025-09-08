import { USER_ADDRESS, AMOUNT } from '../constants'
import { createApp, h } from 'vue'
import { ParaportPlugin, Paraport } from '@paraport/vue'
import '@paraport/vue/style'

const app = createApp({
  render() {
    return h(
      Paraport,
      {
        label: 'Mint',
        address: this.address,
        amount: this.amount,
        chain: 'AssetHubKusama',
        asset: 'KSM',
        onReady: this.onReady,
        onAddFunds: this.onAddFunds,
        onCompleted: this.onCompleted,
        onSubmit: this.onSubmit
      }
    )
  },
  data() {
    return {
      address: USER_ADDRESS,
      amount: AMOUNT
    }
  },
  methods: {
    onReady(session) {
      console.log('🚀 ParaPort ready!', session)
    },
    onAddFunds() {
      console.log('💰 Add funds button pressed')
    },
    onCompleted() {
      console.log('✅ Auto-teleport successfully completed!')
    },
    onSubmit({ autoteleport, completed }) {
      console.log('📦 Submit button pressed')
      console.log('💥 Autoteleport: ', autoteleport)
      console.log('✅ Completed: ', completed)
    }
  }
})

app.use(ParaportPlugin)

app.mount('#root')
