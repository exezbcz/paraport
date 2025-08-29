# @paraport/sdk

Vue components for seamless integration of ParaPort cross-chain teleportation functionality.

## Installation

```bash
pnpm add @paraport/sdk
```

## Component Usage

### Basic Integration

```typescript
import { type MountOptions, init } from '@paraport/sdk'

const options: MountOptions = {
  integratedTargetId: 'teleport-container',
  autoteleport: {
    address: USER_ADDRESS,
    amount: AMOUNT,
    chain: 'AssetHubKusama',
    asset: 'KSM',
  },
  label: 'Teleport',
  onSubmit: (autoTeleport) => {
    console.log('Teleport submitted:', autoTeleport)
  },
  onCompleted: () => {
    console.log('Teleport completed')
  }
}

const { update, destroy } = init(options)
```

## Props Documentation

### MountOptions

| Property | Type | Description |
|----------|------|-------------|
| integratedTargetId | string | DOM element ID for component mounting |
| autoteleport | Object | Teleport configuration object |
| label | string | Button display text |
| onSubmit | Function | Callback on form submission |
| onCompleted | Function | Callback on successful teleport |
| onReady | Function | Callback when UI is ready for interaction |
| onAddFunds | Function | Callback when user clicks to add funds |

## Development

Refer to the main [monorepo documentation](../README.md) for setup instructions and contribution guidelines.

## License

MIT