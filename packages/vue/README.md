# @paraport/vue

Vue component for seamless integration of ParaPort cross-chain teleportation functionality.

## Installation

```bash
pnpm add @paraport/vue
```

## Component Usage

### Basic Integration

```typescript
import { createApp } from 'vue'
import { ParaportPlugin } from '@paraport/vue'
import '@paraport/vue/style'

const app = createApp({
  /* your app config */
})

// Register the plugin
app.use(ParaportPlugin)

// Then use the component in your templates
```

```vue
<template>
  <Paraport
    :address="address"
    :amount="amount"
    :chain="chain"
    :asset="asset"
    :label="label"
    @ready="onReady"
    @submit="onSubmit"
    @completed="onCompleted"
    @addFunds="onAddFunds"
  />
</template>

<script setup>
import { ref } from 'vue'

const address = ref('YOUR_ADDRESS')
const amount = ref('YOUR_AMOUNT')
const chain = ref('AssetHubKusama')
const asset = ref('KSM')
const label = ref('Mint')

const onReady = (session) => {
  console.log('🚀 ParaPort ready!', session)
}

const onSubmit = ({ autoteleport, completed }) => {
  console.log('📦 Submit button pressed')
  console.log('💥 Autoteleport: ', autoteleport)
  console.log('✅ Completed: ', completed)
}

const onCompleted = () => {
  console.log('✅ Auto-teleport successfully completed!')
}

const onAddFunds = () => {
  console.log('💰 Add funds button pressed')
}
</script>
```

## Props Documentation

### MountOptions

| Property | Type | Description |
|----------|------|-------------|
| address | string | User's address |
| amount | string | Amount to be transferred |
| chain | string | Chain ID (e.g., 'AssetHubKusama') |
| asset | string | Asset ID |
| label | string | Button display text |
| logLevel | string | Log level for debugging (e.g., 'DEBUG') |
| onSubmit | Function | Callback on form submission with { autoteleport, completed } parameters |
| onCompleted | Function | Callback on successful teleport |
| onReady | Function | Callback when UI is ready for interaction, receives session object |
| onAddFunds | Function | Callback when user clicks to add funds |

## License

MIT
