<p align="center">
  <img src="https://github.com/user-attachments/assets/b45d0026-9533-4e49-915b-085c1ac6ba84" alt="ParaPort Logo" width="420" />
</p>

# ParaPort SDK Monorepo

ParaPort enables “auto-teleport” flows in the Polkadot ecosystem — automatically funding the destination and guiding users through cross-chain transfers with a drop‑in UI or framework components.

## Packages

- [@paraport/core](https://github.com/exezbcz/paraport/tree/main/packages/core#readme) — core logic and evented session management for auto‑teleport
- [@paraport/vue](https://github.com/exezbcz/paraport/tree/main/packages/vue/README.md) — Vue 3 component library and plugin
- [@paraport/react](https://github.com/exezbcz/paraport/tree/main/packages/react/README.md) — React component wrapper
- [@paraport/sdk](https://github.com/exezbcz/paraport/tree/main/packages/sdk/README.md) — framework‑agnostic, embeddable UI (ships CSS + init API)
- [@paraport/static](https://github.com/exezbcz/paraport/tree/main/packages/static/README.md) — chain metadata, providers and constants

## Integrations

- React integration: see [@paraport/react](https://github.com/exezbcz/paraport/tree/main/packages/react/README.md#component-usage) usage and props
- Vue 3 integration: see [@paraport/vue](https://github.com/exezbcz/paraport/tree/main/packages/vue/README.md#component-usage) usage and props
- Embedded SDK: see [@paraport/sdk](https://github.com/exezbcz/paraport/tree/main/packages/sdk/README.md#component-usage) usage and options

Notes
- UI packages declare `polkadot-api` as a peer dependency.
- `getSigner` is required; custom RPC `endpoints` are optional.

## Development

```bash
# Install workspace deps
pnpm install

# Build core (and related)
pnpm build

# Run all package dev builds in watch mode
pnpm dev

# Lint focused packages
pnpm lint
```

Requirements
- Node.js (LTS)
- pnpm 9.1.3+

## License

MIT
