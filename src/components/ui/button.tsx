import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  [
    'relative inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap font-medium',
    'transition-[background-color,box-shadow,color,border-color,transform,opacity] duration-150 ease-out',
    'disabled:pointer-events-none disabled:opacity-45',
    'active:scale-[0.985]',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ].join(' '),
  {
    variants: {
      variant: {
        primary:
          'bg-brand text-brand-fg shadow-[0_1px_2px_rgb(17_18_28/0.16),inset_0_1px_0_hsl(0_0%_100%/0.14)] hover:bg-brand-hover active:bg-brand-active',
        secondary:
          'bg-surface text-ink shadow-[0_0_0_1px_hsl(var(--line-strong)),0_1px_2px_rgb(17_18_28/0.04)] hover:bg-surface-2 hover:shadow-[0_0_0_1px_hsl(var(--line-strong)),0_2px_6px_-2px_rgb(17_18_28/0.08)]',
        outline: 'border border-line-strong bg-transparent text-ink hover:bg-surface-2',
        ghost: 'text-ink-muted hover:bg-surface-3 hover:text-ink',
        subtle: 'bg-surface-3 text-ink hover:bg-line',
        destructive:
          'bg-danger text-white shadow-[0_1px_2px_rgb(17_18_28/0.16),inset_0_1px_0_hsl(0_0%_100%/0.14)] hover:brightness-[1.06] active:brightness-95',
        'destructive-quiet': 'bg-danger-soft text-danger-ink hover:bg-danger/15',
        success:
          'bg-success text-white shadow-[0_1px_2px_rgb(17_18_28/0.16),inset_0_1px_0_hsl(0_0%_100%/0.14)] hover:brightness-[1.06]',
        link: 'text-brand-ink underline-offset-4 hover:underline',
        brandSoft: 'bg-brand-soft text-brand-ink hover:bg-brand/15',
      },
      /**
       * Every size is taller on a phone and returns to its desk proportions at
       * `sm`. A control sized for a cursor is a control you miss with a thumb,
       * and doing it here rather than at ~200 call sites is the only way it
       * stays true as the product grows.
       */
      size: {
        xs: 'h-9 rounded-md px-3 text-xs sm:h-7 sm:px-2 [&_svg]:size-3.5',
        sm: 'h-10 rounded-lg px-3 text-sm sm:h-8 sm:px-2.5 [&_svg]:size-4',
        md: 'h-11 rounded-lg px-4 text-base sm:h-9 sm:px-3.5 [&_svg]:size-4',
        lg: 'h-12 rounded-xl px-4.5 text-base sm:h-10 sm:px-4 [&_svg]:size-4',
        xl: 'h-13 rounded-xl px-5 text-md sm:h-12 [&_svg]:size-[18px]',
        icon: 'size-11 rounded-lg sm:size-9 [&_svg]:size-4',
        'icon-sm': 'size-10 rounded-lg sm:size-8 [&_svg]:size-4',
        'icon-xs': 'size-10 rounded-md sm:size-7 [&_svg]:size-3.5',
      },
      block: { true: 'w-full' },
    },
    defaultVariants: { variant: 'secondary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  trailing?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, block, asChild, loading, icon, trailing, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, block }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {asChild ? (
          children
        ) : (
          <>
            {loading ? <LoaderCircle className="animate-spin" aria-hidden /> : icon}
            {children}
            {trailing}
          </>
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
