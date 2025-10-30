# ParaPort Playground

Local-only sandbox for developing and testing ParaPort packages and examples. This app exists purely for internal/local development and is not intended for production use or publishing.

## Quick Start

- Install dependencies at the repo root: `pnpm install`
- Run the playground:
  - From repo root: `pnpm --filter @paraport/playground dev`
  - Or inside `apps/playground`: `pnpm dev`

## What’s Inside

- Example UIs in `react/` and `vue/`
- Direct SDK usage in `sdk/`
- Vite-based dev server and minimal scaffolding

## Notes

- Uses workspace-linked `@paraport/*` packages for local iteration
- Assumes local/test network settings; not production-hardened
