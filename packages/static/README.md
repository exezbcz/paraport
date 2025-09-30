# @paraport/static

Static configuration and constants for ParaPort SDK

## Installation

```bash
# npm
npm install @paraport/static

# yarn
yarn add @paraport/static

# pnpm
pnpm install @paraport/static
```

## Usage

```js
// ESM
import * as static from "@paraport/static";

// CommonJS
const static = require("@paraport/static");
```

## Configuration Files

### 🔧 Chains
Static chain files including decimals, symbol, and ss58 formats
```js
import { CHAINS } from "@paraport/static";
```

### 🔧 Endpoints
Map of RPC endpoints for each chain
```js
import { ENDPOINT_MAP } from "@paraport/static";
```

### 🔧 Names
Chain name mappings for frontend display
```js
import { CHAIN_NAMES } from "@paraport/static";
```

### 🔧 Types
Miscellaneous type definitions
```js
import { TYPES } from "@paraport/static";
```

## Developer Notes

### Endpoint Generation

The RPC endpoints are pre-generated to avoid external dependencies in the published package. The endpoint generator is automatically set up during package installation via the postinstall script in the root package.json, and the endpoints are automatically generated during the prebuild process.

The endpoint generator is maintained in a separate directory to isolate Polkadot dependencies and prevent version conflicts with the main project.

#### Automatic Process

When you install dependencies or build the package, the following happens automatically:

1. The endpoint generator is set up during `pnpm install` via the postinstall script
2. The endpoints are generated automatically when building the package via the prebuild script

#### Manual Process (if needed)

If you need to manually update the endpoints:

1. The endpoint generator setup is already done during installation, but if needed you can run it manually:
```bash
cd scripts/endpoint-generator
pnpm run setup
```

2. Run the endpoint generation script:
```bash
cd scripts/endpoint-generator
pnpm run generate
```

3. Build the package:
```bash
cd packages/static
pnpm build
```

## License

Made with 💛

Published under [MIT License](LICENSE).