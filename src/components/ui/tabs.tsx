import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export const Tabs = TabsPrimitive.Root

/**
 * Contextual navigation as a quiet row of chips. No full-width rule, because a
 * horizontal border cuts the page in half and fights the hero's fade.
 */
export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn('no-scrollbar -mx-1 flex items-center gap-0.5 overflow-x-auto px-1 py-1', className)}
    {...props}
  />
))
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & { count?: number }
>(({ className, children, count, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      'group relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-base font-medium',
      'text-ink-subtle transition-colors duration-150 hover:text-ink',
      'data-[state=active]:text-ink',
      '[&_svg]:size-4 [&_svg]:text-ink-faint data-[state=active]:[&_svg]:text-brand',
      className,
    )}
    {...props}
  >
    <span className="relative flex items-center gap-2">
      {children}
      {count != null && (
        <span className="rounded-md bg-veil-strong px-1.5 py-px text-2xs font-semibold tabular-nums text-ink-muted group-data-[state=active]:bg-brand-soft group-data-[state=active]:text-brand-ink">
          {count}
        </span>
      )}
    </span>
  </TabsPrimitive.Trigger>
))
TabsList.displayName = 'TabsList'

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn('focus-visible:outline-none data-[state=active]:animate-fade-up', className)}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

/**
 * Chip-style tab row with a sliding indicator. Used where tabs are the page's
 * primary navigation rather than a minor filter.
 */
export function ChipTabs<T extends string>({
  value,
  onValueChange,
  items,
  className,
  layoutId = 'chip-tabs',
}: {
  value: T
  onValueChange: (v: T) => void
  items: { value: T; label: React.ReactNode; icon?: React.ReactNode; count?: number }[]
  className?: string
  layoutId?: string
}) {
  return (
    <div
      className={cn('no-scrollbar -mx-1 flex items-center gap-0.5 overflow-x-auto px-1 py-1', className)}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onValueChange(item.value)}
            className={cn(
              'relative inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-base font-medium transition-colors',
              active ? 'text-ink' : 'text-ink-subtle hover:text-ink',
              '[&_svg]:size-4',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-full bg-veil-strong"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            )}
            <span
              className={cn(
                'relative flex items-center gap-2',
                active ? '[&_svg]:text-brand' : '[&_svg]:text-ink-faint',
              )}
            >
              {item.icon}
              {item.label}
              {item.count != null && (
                <span
                  className={cn(
                    'rounded-md px-1.5 py-px text-2xs font-semibold tabular-nums',
                    active ? 'bg-brand-soft text-brand-ink' : 'bg-veil-strong text-ink-muted',
                  )}
                >
                  {item.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
