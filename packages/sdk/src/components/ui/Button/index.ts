import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

export { default as Button } from './Button.vue'

const BASE_PILL = 'rounded-full !h-6 !px-2 !py-1 text-xs !gap-1'

export const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/90',
				destructive:
					'bg-destructive text-destructive-foreground hover:bg-destructive/90',
				outline:
					'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
				secondary:
					'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: 'hover:bg-accent hover:text-accent-foreground',
				link: 'text-primary underline-offset-4 hover:underline',
				'pill-info': `${BASE_PILL} text-secondary bg-surface-grey hover:bg-surface-hover [&.active]:bg-primary`,
				'pill-warning': `${BASE_PILL} text-caution-text bg-caution-button hover:bg-caution-fill`,
				'pill-danger': `${BASE_PILL} text-error-text bg-error-fill hover:bg-error-action-hover`,
				'pill-success': `${BASE_PILL} text-success-text bg-success-fill hover:bg-success-action-hover`,
				'pill-blue': `${BASE_PILL} text-accent-blue bg-accent-background`,
			},
			size: {
				default: 'h-12 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
