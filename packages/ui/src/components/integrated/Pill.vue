<template>
    <component
        :is="props.as"
        class="flex gap-2 py-1 px-2 rounded-full items-center justify-center text-xs capitalize"
        :class="pillVariantClasses[props.variant]"
    >
        <slot :size="12" />
    </component>
</template>

<script setup lang="ts">
type PillVariant = 'info' | 'success' | 'warning' | 'error'

const pillVariantClasses: Record<PillVariant, string> = {
	info: 'text-secondary bg-surface-grey',
	success: 'text-success bg-success',
	warning: 'text-warning bg-warning',
	error: 'text-error-text bg-error-fill',
}

const props = withDefaults(
	defineProps<{
		variant: PillVariant
		as?: string
	}>(),
	{
		as: 'div',
	},
)
</script>
