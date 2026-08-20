import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Select = SelectPrimitive.Root
export const SelectValue = SelectPrimitive.Value
export const SelectGroup = SelectPrimitive.Group

export const SelectTrigger = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, children, size = 'md', ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between gap-2 bg-surface text-start text-ink',
      'shadow-[0_0_0_1px_hsl(var(--line-strong)),0_1px_2px_rgb(17_18_28/0.03)]',
      'transition-shadow duration-150 hover:shadow-[0_0_0_1px_hsl(var(--line-strong)),0_1px_3px_rgb(17_18_28/0.06)]',
      'focus:outline-none focus-visible:shadow-[0_0_0_1px_hsl(var(--brand)),0_0_0_4px_hsl(var(--brand)/0.14)]',
      'data-[state=open]:shadow-[0_0_0_1px_hsl(var(--brand)),0_0_0_4px_hsl(var(--brand)/0.14)]',
      'disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-subtle',
      'data-[placeholder]:text-ink-faint [&_svg]:shrink-0',
      size === 'sm' && 'h-8 rounded-lg px-2.5 text-sm',
      size === 'md' && 'h-9 rounded-lg px-3 text-base',
      size === 'lg' && 'h-11 rounded-xl px-3.5 text-md',
      className,
    )}
    {...props}
  >
    <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="size-4 text-ink-faint transition-transform duration-200 data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = 'SelectTrigger'

export const SelectContent = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = 'popper', ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      sideOffset={6}
      className={cn(
        'relative z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl bg-surface p-1 shadow-pop',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
        'duration-150 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="max-h-64 overflow-y-auto">{children}</SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = 'SelectContent'

export const SelectItem = React.forwardRef<
  React.ComponentRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { hint?: React.ReactNode }
>(({ className, children, hint, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center gap-2 rounded-lg py-[7px] pe-8 ps-2.5 text-base text-ink outline-none',
      'data-[disabled]:pointer-events-none data-[highlighted]:bg-surface-3 data-[disabled]:opacity-45',
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    {hint && <span className="me-1 ms-auto text-xs text-ink-faint">{hint}</span>}
    <SelectPrimitive.ItemIndicator className="absolute end-2.5">
      <Check className="size-4 text-brand" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
))
SelectItem.displayName = 'SelectItem'

export function SelectLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      className={cn(
        'px-2.5 pb-1 pt-2 text-2xs font-semibold uppercase tracking-wider text-ink-faint',
        className,
      )}
      {...props}
    />
  )
}
