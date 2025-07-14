
import { createApp } from 'vue'
import { type AutoTeleportSDK } from '@autoteleport/core'
import AutoTeleportButton from './components/AutoTeleportButton.vue'

export interface MountOptions {
  sdk: AutoTeleportSDK;
  target: string | HTMLElement;
}

export function mount({ target, sdk }: MountOptions): void {
  const targetElement = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!targetElement) {
    throw new Error(`Target element not found: ${target}`);
  }

  const app = createApp(AutoTeleportButton)

  app.provide('sdk', sdk)

  app.mount(targetElement)
}
