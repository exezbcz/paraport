# @paraport/sdk

UI layer for seamless integration of ParaPort cross-chain teleportation functionality.

## Installation

```bash
pnpm add @paraport/sdk polkadot-api
```

### Install Peer Dependencies

ParaPort SDK requires `polkadot-api` in your application. Install it as a peer dependency:

```bash
# Required peer dependency
pnpm add polkadot-api
```

## Component Usage

### Basic Integration

```typescript
import '@paraport/sdk/style'
import * as paraport from '@paraport/sdk'

const main = async () => {
  paraport.init({
    integratedTargetId: 'root',
    address: USER_ADDRESS,
    amount: '500000000000', // 0.5 KSM
    chain: 'AssetHubKusama',
    asset: 'KSM',
    label: 'Mint',
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

## Theming

You can customize the UI via CSS variables or per instance:

- Global: override tokens under `.paraport` in your app stylesheet using cascade layers.
- Per instance: pass `appearance` (map of CSS variables) and `themeMode` to `init`.

```ts
paraport.init({
  integratedTargetId: 'root',
  // ...required params
  appearance: { '--radius': '12px', '--accent-blue': '#4f46e5' },
  themeMode: 'auto', // 'light' | 'dark' | 'auto'
})
```

## Props Documentation

### MountOptions

| Property | Type | Description |
|----------|------|-------------|
| integratedTargetId | string | DOM element ID for component mounting |
| address | string | User's address |
| amount | string | Amount to be teleported |
| chain | string | Chain to be teleported to |
| asset | string | Asset to be teleported |
| label | string | Button display text |
| logLevel | string | Log level for debugging (e.g., 'DEBUG') |
| onSubmit | Function | Callback on form submission with { autoteleport, completed } parameters |
| onCompleted | Function | Callback on successful teleport |
| onReady | Function | Callback when UI is ready for interaction |
| onAddFunds | Function | Callback when user clicks to add funds |


## License

MIT
