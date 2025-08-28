# ParaPort SDK

AutoTeleport SDK is a powerful toolkit for seamless cross-chain teleportation in the Polkadot/Substrate ecosystem. It provides a user-friendly interface for handling cross-chain token transfers.

## 📦 Package Structure

This monorepo contains the following packages:

- `@paraport/core`: Core functionality for cross-chain teleportation
- `@paraport/ui`: Vue-based UI components for integration
- `@paraport/static`: Static assets and utilities
- `playground`: Development and testing environment

## 🚀 Installation

```bash
pnpm install @paraport/core @paraport/ui
```

## 💡 Usage

### Basic Integration

```typescript
import { init } from '@paraport/ui'
import type { MountOptions } from '@paraport/ui'

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

### Display Modes

The SDK supports different display modes for integration:

- `DisplayMode.Integrated`: Embed the teleport interface directly in your application

## 🛠️ Development

### Setup

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build packages
pnpm build

# Lint code
pnpm lint
```

### Project Requirements

- Node.js
- pnpm 9.1.3+

## 🔗 Dependencies

Core dependencies include:

- `@polkadot/api`: Polkadot/Substrate API
- `@paraspell/sdk-pjs`: ParaSpell SDK for cross-chain operations
- Vue.js for UI components
