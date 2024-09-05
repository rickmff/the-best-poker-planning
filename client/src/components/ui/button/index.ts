import { type VariantProps, cva } from 'class-variance-authority'

export { default as Button } from '@/components/ui/button/Button.vue'

export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300',
  {
    variants: {
      variant: {
        default: 'bg-primary text-gray-50 hover:bg-primary/90 dark:bg-gray-50 dark:text-primary dark:hover:bg-gray-50/90',
        destructive:
          'bg-red-500 text-gray-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90',
        outline:
          'border border-gray-200 bg-white hover:bg-gray-100 hover:text-primary dark:border-secondary dark:bg-gray-950 dark:hover:bg-secondary dark:hover:text-gray-50',
        secondary:
          'bg-gray-100 text-primary hover:bg-gray-100/80 dark:bg-secondary dark:text-gray-50 dark:hover:bg-secondary/80',
        ghost: 'hover:bg-gray-100 hover:text-primary dark:hover:bg-secondary dark:hover:text-gray-50',
        link: 'text-primary underline-offset-4 hover:underline dark:text-gray-50',
      },
      size: {
        default: 'h-10 px-4 py-2',
        xs: 'h-7 rounded px-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-20 rounded-md px-32',
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
