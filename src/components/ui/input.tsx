import * as React from 'react'
import { cn } from '@/lib/utils'

const base = [
  'w-full bg-surface text-ink placeholder:text-ink-faint',
  'shadow-[0_0_0_1px_hsl(var(--line-strong)),0_1px_2px_rgb(17_18_28/0.03)]',
  'transition-[box-shadow,background-color] duration-150',
  'hover:shadow-[0_0_0_1px_hsl(var(--line-strong)),0_1px_3px_rgb(17_18_28/0.06)]',
  'focus:outline-none focus:shadow-[0_0_0_1px_hsl(var(--brand)),0_0_0_4px_hsl(var(--brand)/0.14)]',
  'disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-subtle',
  'aria-[invalid=true]:shadow-[0_0_0_1px_hsl(var(--danger)),0_0_0_4px_hsl(var(--danger)/0.12)]',
].join(' ')

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leading?: React.ReactNode
  trailing?: React.ReactNode
  inputSize?: 'sm' | 'md' | 'lg'
}

/**
 * Heights grow on a phone and the font never drops below 16px there: iOS Safari
 * zooms the viewport when a focused field is smaller than that, and once it has
 * zoomed nothing on the page lines up again.
 */
const sizes = {
  sm: 'h-9 text-[16px] sm:h-8 sm:text-sm rounded-lg',
  md: 'h-11 text-[16px] sm:h-9 sm:text-base rounded-lg',
  lg: 'h-12 text-[16px] sm:h-11 sm:text-md rounded-xl',
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, leading, trailing, inputSize = 'md', ...props }, ref) => {
    if (leading || trailing) {
      return (
        <div className={cn('group relative flex w-full items-center', className)}>
          {leading && (
            <span className="pointer-events-none absolute start-3 z-10 flex items-center text-ink-faint [&_svg]:size-4">
              {leading}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              base,
              sizes[inputSize],
              leading && 'ps-9',
              trailing ? 'pe-10' : 'pe-3',
              !leading && 'ps-3',
            )}
            {...props}
          />
          {trailing && (
            <span className="absolute end-2.5 flex items-center text-ink-faint [&_svg]:size-4">{trailing}</span>
          )}
        </div>
      )
    }
    return <input ref={ref} className={cn(base, sizes[inputSize], 'px-3', className)} {...props} />
  },
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(base, 'min-h-20 rounded-xl px-3 py-2 text-base', className)} {...props} />
))
Textarea.displayName = 'Textarea'

export const inputBase = base
