import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

const BASE_PILL = 'pp-rounded-full !pp-h-6 !pp-px-2 !pp-py-1 pp-text-xs !pp-gap-1'

export const buttonVariants = cva(
	'pp-inline-flex pp-items-center pp-justify-center pp-gap-2 pp-whitespace-nowrap pp-rounded-xl pp-text-sm pp-font-medium pp-ring-offset-background pp-transition-colors focus-visible:pp-outline-none focus-visible:pp-ring-2 focus-visible:pp-ring-ring focus-visible:pp-ring-offset-2 disabled:pp-pointer-events-none disabled:pp-opacity-50 [&_svg]:pp-pointer-events-none [&_svg]:pp-size-4 [&_svg]:pp-shrink-0',
	{
		variants: {
			variant: {
				default: 'pp-bg-primary pp-text-primary-foreground hover:pp-bg-primary/90',
				destructive:
					'pp-bg-destructive pp-text-destructive-foreground hover:pp-bg-destructive/90',
				outline:
					'pp-border pp-border-input pp-bg-background hover:pp-bg-accent hover:pp-text-accent-foreground',
				secondary:
					'pp-bg-secondary pp-text-secondary-foreground hover:pp-bg-secondary/80',
				ghost: 'hover:pp-bg-accent hover:pp-text-accent-foreground',
				link: 'pp-text-primary pp-underline-offset-4 hover:pp-underline',
				'pill-info': `${BASE_PILL} pp-text-secondary pp-bg-surface-grey hover:pp-bg-surface-hover [&.active]:pp-bg-primary`,
				'pill-warning': `${BASE_PILL} pp-text-caution-text pp-bg-caution-button hover:pp-bg-caution-fill`,
				'pill-danger': `${BASE_PILL} pp-text-error-text pp-bg-error-fill hover:pp-bg-error-action-hover`,
				'pill-success': `${BASE_PILL} pp-text-success-text pp-bg-success-fill hover:pp-bg-success-action-hover`,
				'pill-blue': `${BASE_PILL} pp-text-accent-blue pp-bg-accent-background`,
			},
			size: {
				default: 'pp-h-12 pp-px-4 pp-py-2',
				sm: 'pp-h-9 pp-rounded-md pp-px-3',
				lg: 'pp-h-11 pp-rounded-md pp-px-8',
				icon: 'pp-h-10 pp-w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
