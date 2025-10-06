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
        onCompleted: this.onCompleted
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
    onReady() {
      console.log('Ready')
    },
    onAddFunds() {
      console.log('Add Funds')
    },
    onCompleted() {
      console.log('Completed')
    }
  }
})

app.use(ParaportPlugin)

app.mount('#root')
