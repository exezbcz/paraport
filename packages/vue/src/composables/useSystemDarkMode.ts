import { usePreferredDark } from '@vueuse/core'
import { watchEffect } from 'vue'

export default function (mode: 'light' | 'dark' | 'auto' = 'auto') {
  const prefersDark = usePreferredDark()

  watchEffect(() => {
    const isDark = mode === 'dark' || (mode === 'auto' && prefersDark.value)
    document.documentElement.classList.toggle('dark', isDark)
  })

  return {
    prefersDark,
  }
}
