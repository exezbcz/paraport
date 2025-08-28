<template>
  <span class="text-text flex gap-[2px] capitalize">
    <span :class="deviderClass">~</span>
    <span>{{ formattedTime }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t }: { t: any } = useI18n()

const props = defineProps<{
	value: number
	deviderClass?: string
	short?: boolean
}>()

const formattedTime = computed(() => {
	const totalSeconds = Math.floor(props.value / 1000)

	if (totalSeconds >= 60) {
		const minutes = Math.round(totalSeconds / 60)
		return t(props.short ? 'time.minutes_short' : 'time.minutes', minutes, {
			count: minutes,
		})
	} else {
		return t(
			props.short ? 'time.seconds_short' : 'time.seconds',
			totalSeconds,
			{
				count: totalSeconds,
			},
		)
	}
})
</script>
