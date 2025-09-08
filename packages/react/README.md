# @paraport/react

React components for seamless integration of ParaPort cross-chain teleportation functionality.

## Installation

```bash
pnpm add @paraport/react
```

### Install Peer Dependencies

ParaPort React is designed to work with PolkadotJS API and React. Install the required peer dependencies:

```bash
# React peer dependencies
pnpm add react react-dom

# PolkadotJS peer dependencies
pnpm add @polkadot/api @polkadot/extension-dapp @polkadot/types @polkadot/util @polkadot/util-crypto
```

## Component Usage

### Basic Integration

```tsx
import React, { useCallback } from 'react';
import { Paraport } from '@paraport/react';
import '@paraport/react/style';

const App = () => {
  const address = 'YOUR_ADDRESS';
  const amount = 'YOUR_AMOUNT';
  const chain = 'AssetHubKusama';
  const asset = 'KSM';
  const label = 'Mint';

  const handleReady = useCallback((session) => {
    console.log('🚀 ParaPort ready!', session);
  }, []);

  const handleSubmit = useCallback(({ autoteleport, completed }) => {
    console.log('📦 Submit button pressed');
    console.log('💥 Autoteleport: ', autoteleport);
    console.log('✅ Completed: ', completed);
  }, []);

  const handleCompleted = useCallback(() => {
    console.log('✅ Auto-teleport successfully completed!');
  }, []);

  const handleAddFunds = useCallback(() => {
    console.log('💰 Add funds button pressed');
  }, []);

  return (
    <Paraport
      address={address}
      amount={amount}
      chain={chain}
      asset={asset}
      label={label}
      onReady={handleReady}
      onSubmit={handleSubmit}
      onCompleted={handleCompleted}
      onAddFunds={handleAddFunds}
    />
  );
};

export default App;
```

## Props Documentation

### ParaportProps

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