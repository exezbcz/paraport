# ParaPort SDK

AutoTeleport SDK is a powerful toolkit for seamless cross-chain teleportation in the Polkadot/Substrate ecosystem. It provides a user-friendly interface for handling cross-chain token transfers.

## 📦 Package Structure

This monorepo contains the following packages:

- `@paraport/core`: Core functionality for cross-chain teleportation
- `@paraport/sdk`: Vue-based SDK components for integration
- `@paraport/static`: Static assets and utilities
- `playground`: Development and testing environment

## 🚀 Installation

```bash
pnpm install @paraport/core @paraport/sdk
```

## 💡 Usage

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
