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

## License

Made with 💛

Published under [MIT License](LICENSE).