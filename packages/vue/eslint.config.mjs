// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  // Enable stylistic formatting and Vue SFC support
  stylistic: true,
  vue: true,
  ignores: [
    'dist/**',
    'node_modules/**',
    '**/.vite/**',
    '**/coverage/**',
    'components.json',
    // '**/*.md',
    // '**/README.md',
  ],
  rules: {
    // Library components are often single-word
    'vue/multi-word-component-names': 'off',
  },
})
