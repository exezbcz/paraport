import { usePreferredDark } from '@vueuse/core'
import { watchEffect } from 'vue'

export default function () {
	const prefersDark = usePreferredDark()

	watchEffect(() => {
		if (prefersDark.value) {
			document.documentElement.classList.add('dark')
		} else {
			document.documentElement.classList.remove('dark')
		}
	})

	return {
		prefersDark,
	}
}
