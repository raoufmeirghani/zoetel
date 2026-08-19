import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap font-medium [&_svg]:size-3 [&_svg]:shrink-0',
  {
    variants: {
      tone: {
        neutral: 'bg-veil-strong text-ink-muted',
        outline: 'bg-transparent text-ink-muted shadow-[inset_0_0_0_1px_hsl(var(--line-strong))]',
        brand: 'bg-brand-soft text-brand-ink',
        success: 'bg-success-soft text-success-ink',
        info: 'bg-info-soft text-info-ink',
        warning: 'bg-warning-soft text-warning-ink',
        danger: 'bg-danger-soft text-danger-ink',
        solid: 'bg-ink text-ink-inverse',
      },
      size: {
        sm: 'h-5 rounded-[6px] px-1.5 text-2xs',
        md: 'h-6 rounded-md px-2 text-xs',
        lg: 'h-7 rounded-lg px-2.5 text-sm',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />
}

export { badgeVariants }
