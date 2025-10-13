<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    text: string
    outlineClass?: string
    outlineWidth?: string
    animationDuration?: number
    startColor?: string
    endColor?: string
    gradientDirection?: string
  }>(),
  {
    outlineClass: 'pp-text-gray-400',
    outlineWidth: '0.5px',
    animationDuration: 2,
    startColor: '#8F8F8F',
    endColor: '#C9C9C9',
    gradientDirection: '-45deg',
  },
)

// Create the gradient style with all CSS variables
const gradientStyle = computed(() => ({
  '--start-color': props.startColor,
  '--end-color': props.endColor,
  '--gradient-direction': props.gradientDirection,
  '--animation-duration': `${props.animationDuration}s`,
}))
</script>

<template>
  <p class="pp-relative">
    <span class="pp-relative pp-inline-block">
      <!-- Text outline for definition -->
      <span
        :class="[outlineClass]"
        class="pp-absolute pp-inset-0 pp-text-transparent"
        :style="{ '-webkit-text-stroke': `${outlineWidth} currentColor` }"
      >
        {{ text }}
      </span>

      <!-- Gradient text with animation -->
      <span class="gradient-text-animation pp-relative" :style="gradientStyle">
        {{ text }}
      </span>
    </span>
  </p>
</template>

<style>
.gradient-text-animation {
  background: linear-gradient(
    var(--gradient-direction, -45deg),
    var(--start-color, #8F8F8F),
    var(--end-color, #C9C9C9),
    var(--start-color, #8F8F8F)
  );
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  background-size: 200% 100%;
  animation: gradientShift var(--animation-duration, 1s) infinite linear;
}

@keyframes gradientShift {
  0% { background-position: 200% 50%; }
  100% { background-position: 0% 50%; }
}
</style>
