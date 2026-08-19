import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & { size?: 'sm' | 'md' }
>(({ className, size = 'md', ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'peer inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200',
      'data-[state=checked]:bg-brand data-[state=unchecked]:bg-line-strong',
      'disabled:cursor-not-allowed disabled:opacity-50',
      size === 'md' ? 'h-[22px] w-[38px] p-0.5' : 'h-[18px] w-[31px] p-0.5',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block rounded-full bg-white shadow-[0_1px_2px_rgb(17_18_28/0.2)] transition-transform duration-200 ease-swift',
        size === 'md'
          ? 'size-[18px] data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0'
          : 'size-[14px] data-[state=checked]:translate-x-[13px] data-[state=unchecked]:translate-x-0',
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = 'Switch'

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & { indeterminate?: boolean }
>(({ className, indeterminate, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer flex size-4 shrink-0 items-center justify-center rounded-[5px] transition-all duration-150',
      'shadow-[inset_0_0_0_1px_hsl(var(--line-strong))] hover:shadow-[inset_0_0_0_1px_hsl(var(--ink)/0.3)]',
      'data-[state=checked]:bg-brand data-[state=checked]:shadow-none',
      'data-[state=indeterminate]:bg-brand data-[state=indeterminate]:shadow-none',
      'disabled:cursor-not-allowed disabled:opacity-45',
      className,
    )}
    checked={indeterminate ? 'indeterminate' : props.checked}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="text-white">
      {indeterminate ? (
        <Minus className="size-3" strokeWidth={3} />
      ) : (
        <Check className="size-3" strokeWidth={3.2} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = 'Checkbox'

export const RadioGroup = RadioGroupPrimitive.Root

export const RadioItem = React.forwardRef<
  React.ComponentRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    ref={ref}
    className={cn(
      'flex size-[18px] shrink-0 items-center justify-center rounded-full transition-all duration-150',
      'shadow-[inset_0_0_0_1px_hsl(var(--line-strong))] hover:shadow-[inset_0_0_0_1px_hsl(var(--ink)/0.3)]',
      'data-[state=checked]:bg-brand data-[state=checked]:shadow-none',
      'disabled:cursor-not-allowed disabled:opacity-45',
      className,
    )}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="block size-[7px] rounded-full bg-white" />
  </RadioGroupPrimitive.Item>
))
RadioItem.displayName = 'RadioItem'

/** Compact segmented control — used for filters and view switches. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  size = 'md',
  className,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: React.ReactNode; icon?: React.ReactNode }[]
  size?: 'sm' | 'md'
  className?: string
}) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-0.5 rounded-xl bg-surface-3 p-0.5',
        size === 'sm' ? 'h-8' : 'h-9',
        className,
      )}
      role="tablist"
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative inline-flex h-full items-center gap-1.5 rounded-[10px] px-2.5 font-medium transition-colors duration-150',
              size === 'sm' ? 'text-xs' : 'text-sm',
              active ? 'text-ink' : 'text-ink-subtle hover:text-ink-muted',
              '[&_svg]:size-3.5',
            )}
          >
            {active && (
              <span className="absolute inset-0 rounded-[10px] bg-surface shadow-[0_1px_2px_rgb(17_18_28/0.08),0_0_0_1px_rgb(17_18_28/0.03)]" />
            )}
            <span className="relative flex items-center gap-1.5">
              {o.icon}
              {o.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
