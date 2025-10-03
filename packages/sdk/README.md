# @paraport/sdk

UI layer for seamless integration of ParaPort cross-chain teleportation functionality.

## Installation

```bash
pnpm add @paraport/sdk
```

## Component Usage

### Basic Integration

```typescript
import '@paraport/sdk/style'
import * as paraport from '@paraport/sdk'

const main = async () => {
  paraport.init({
    integratedTargetId: 'root',
    label: 'Mint',
    autoteleport: {
      address: USER_ADDRESS,
      amount: '500000000000', // 0.5 KSM
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
```

## Props Documentation

### MountOptions

| Property | Type | Description |
|----------|------|-------------|
| integratedTargetId | string | DOM element ID for component mounting |
| autoteleport | Object | Teleport configuration object |
| label | string | Button display text |
| logLevel | string | Log level for debugging (e.g., 'DEBUG') |
| onSubmit | Function | Callback on form submission with { autoteleport, completed } parameters |
| onCompleted | Function | Callback on successful teleport |
| onReady | Function | Callback when UI is ready for interaction |
| onAddFunds | Function | Callback when user clicks to add funds |


## License

MIT
