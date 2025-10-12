# @paraport/vue

Vue component for seamless integration of ParaPort cross-chain teleportation functionality.

## Installation

```bash
pnpm add @paraport/vue polkadot-api
```

### Install Peer Dependencies

ParaPort Vue requires `polkadot-api` in your application. Install it as a peer dependency:

```bash
# Required peer dependency
pnpm add polkadot-api
```

## Component Usage

### Basic Integration

```typescript
import { createApp } from 'vue'
import { ParaportPlugin } from '@paraport/vue'
import '@paraport/vue/style'

const app = createApp({
  /* your app config */
})

// Register the plugin
app.use(ParaportPlugin)

// Then use the component in your templates
```

```vue
<template>
  <Paraport
    :address="address"
    :amount="amount"
    :chain="chain"
    :asset="asset"
    :label="label"
    @ready="onReady"
    @submit="onSubmit"
    @completed="onCompleted"
    @addFunds="onAddFunds"
  />
</template>

<script setup>
import { ref } from 'vue'

const address = ref('YOUR_ADDRESS')
const amount = ref('YOUR_AMOUNT')
const chain = ref('AssetHubKusama')
const asset = ref('KSM')
const label = ref('Mint')

const onReady = (session) => {
  console.log('🚀 ParaPort ready!', session)
}

const onSubmit = ({ autoteleport, completed }) => {
  console.log('📦 Submit button pressed')
  console.log('💥 Autoteleport: ', autoteleport)
  console.log('✅ Completed: ', completed)
}

const onCompleted = () => {
  console.log('✅ Auto-teleport successfully completed!')
}

const onAddFunds = () => {
  console.log('💰 Add funds button pressed')
}
</script>
```

## Props Documentation

### Component Props

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
| appearance | Record<string,string> | Optional per‑instance CSS variables (e.g., `{ '--radius': '12px' }`) |
| themeMode | 'light' \\| 'dark' \\| 'auto' | Optional theme mode; defaults to 'auto' (system) |

## License

MIT

## Styling & CSS Layers

ParaPort ships its CSS wrapped in named cascade layers to avoid clashing with a host app’s styles and utilities.

- Layers used by the SDK: `paraport-base`, `paraport-components`, `paraport-utilities`.
- Declare a global layer order in your app so utilities resolve predictably relative to your own styles.

### Recommended integration (Vite/Nuxt/SPA)

1) Create or edit a global stylesheet that loads early (e.g., `src/styles.css`, `assets/main.css`).

```css
/* src/styles.css */
@layer base, components, paraport-base, paraport-components, utilities, paraport-utilities;

/* Import the SDK CSS into the paraport-base layer */
@import '@paraport/vue/style' layer(paraport-base);

/* Optional: minimal reset inside the base layer */
@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
}
```

2) Import that stylesheet once in your app entry.

```ts
// main.ts
import './styles.css'
import { createApp } from 'vue'
import { ParaportPlugin } from '@paraport/vue'

createApp(App).use(ParaportPlugin).mount('#app')
```

Notes for Nuxt 3: add the stylesheet to `nuxt.config.ts` via `css: ['~/assets/main.css']` and place the same `@layer`/`@import` rules in that file.

### Why this is needed

- Host apps often bring Tailwind or other utility CSS. Without a global `@layer` order, an unlayered global rule or late plugin import can override utility classes.
- ParaPort wraps Tailwind output in layers so you can decide precedence. The order above ensures:
  - Your `base`/`components` load first.
  - ParaPort base and components follow.
  - Your utilities win over ParaPort’s only when desired; otherwise `paraport-utilities` can still apply to SDK internals.

### Scoped Preflight (SDK-only)

Tailwind’s global Preflight is disabled in the SDK (`preflight: false`) to avoid affecting host apps. Instead, the SDK ships a scoped preflight at `src/assets/preflight.css` and imports it into the `paraport-base` layer. All rules are scoped under the `.paraport` root so they only apply to SDK UI.

What this scoped preflight covers:
- Base box model and borders: `box-sizing: border-box`, `border-style: solid`, `border-width: 0` on `*, *::before, *::after` so border utilities render reliably.
- Typography spacing: zero UA margins for headings/paragraphs, keep heading font inherit.
- Forms and buttons: inherit fonts/colors; remove native button borders/backgrounds.
- Lists, links, hr, media, tables, hidden/disabled, progress/summary — normalized for predictable layout.

You don’t need to add any global reset for the SDK; the normalization is internal and safe.

### Avoid unlayered global resets

Global rules like `* { padding: 0; margin: 0; }` outside of any layer outrank all layered rules and can break the SDK utilities (e.g., padding classes). If you need a reset, put it inside the `base` layer and keep it minimal:

```css
@layer base {
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; }
}
```

### Troubleshooting

- Utilities not applying (e.g., `.pp-px-4`, `.pp-pt-4`): check DevTools. If you see an unlayered `*` rule winning, move your reset into `@layer base` and declare the global layer order as shown.
- Dialogs or centered elements shift when importing the SDK via a plugin: import the SDK CSS from your global stylesheet with a layer hint (`@import '@paraport/vue/style' layer(paraport-base);`) so Tailwind variable defaults don’t override your utilities.

## Theming (Basics)

Full docs: https://docs.paraport.dev

- Global: override CSS variables under `.paraport` via cascade layers.

```css
@layer base, components, paraport-base, paraport-components, utilities, paraport-utilities;
@import '@paraport/vue/style' layer(paraport-base);

@layer paraport-base {
  .paraport { --radius: 12px; --accent-blue: #4f46e5; }
  .dark .paraport { --background: #0b0b0b; }
}
```

- Per instance (optional):

```vue
<Paraport
  :appearance="{ '--radius': '12px', '--accent-blue': '#4f46e5' }"
  themeMode="auto"  <!-- 'light' | 'dark' | 'auto' -->
  ...
/>
```
