import * as React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  id: string
  label: string
  description?: string
}

/** Horizontal stepper — onboarding and multi-step checkout. */
export function Stepper({
  steps,
  current,
  className,
  onStepClick,
  compact,
}: {
  steps: Step[]
  current: number
  className?: string
  onStepClick?: (index: number) => void
  compact?: boolean
}) {
  return (
    <ol className={cn('flex items-center', className)}>
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        const clickable = onStepClick && i <= current
        return (
          <li key={step.id} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
            <button
              disabled={!clickable}
              onClick={() => clickable && onStepClick(i)}
              className={cn('flex items-center gap-2.5 text-start', clickable && 'cursor-pointer')}
            >
              <span className="relative grid size-6 shrink-0 place-items-center">
                {active && (
                  <motion.span
                    layoutId="stepper-halo"
                    className="absolute inset-0 rounded-full bg-brand/15"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span
                  className={cn(
                    'grid size-[22px] place-items-center rounded-full text-[11px] font-semibold transition-colors duration-300',
                    done && 'bg-brand text-brand-fg',
                    active && 'bg-brand text-brand-fg',
                    !done && !active && 'bg-veil-strong text-ink-faint',
                  )}
                >
                  {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                </span>
              </span>
              {!compact && (
                <span className="hidden min-w-0 sm:block">
                  <span
                    className={cn(
                      'block truncate text-sm font-medium transition-colors',
                      active ? 'text-ink' : done ? 'text-ink-muted' : 'text-ink-faint',
                    )}
                  >
                    {step.label}
                  </span>
                </span>
              )}
            </button>
            {i < steps.length - 1 && (
              <span className="mx-2.5 h-px min-w-4 flex-1 overflow-hidden bg-line">
                <motion.span
                  className="block h-px bg-brand"
                  initial={{ width: 0 }}
                  animate={{ width: done ? '100%' : '0%' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Vertical checklist — KYC document requirements, setup tasks. */
export function StepList({
  steps,
  className,
}: {
  steps: {
    label: string
    description?: string
    state: 'done' | 'active' | 'pending' | 'failed'
    action?: React.ReactNode
  }[]
  className?: string
}) {
  return (
    <ol className={cn('relative space-y-0', className)}>
      {steps.map((s, i) => (
        <li key={i} className="relative flex gap-3.5 pb-5 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className={cn(
                'absolute start-[11px] top-6 h-[calc(100%-1rem)] w-px',
                s.state === 'done' ? 'bg-brand/35' : 'bg-line',
              )}
            />
          )}
          <span className="relative z-10 mt-0.5 shrink-0">
            {s.state === 'done' ? (
              <span className="grid size-[22px] place-items-center rounded-full bg-brand text-brand-fg">
                <Check className="size-3" strokeWidth={3} />
              </span>
            ) : s.state === 'failed' ? (
              <span className="grid size-[22px] place-items-center rounded-full bg-danger text-white">
                <span className="text-xs font-bold leading-none">!</span>
              </span>
            ) : s.state === 'active' ? (
              <span className="relative grid size-[22px] place-items-center rounded-full bg-brand-soft">
                <span className="absolute inset-0 animate-pulse-ring rounded-full bg-brand/40" />
                <span className="size-2 rounded-full bg-brand" />
              </span>
            ) : (
              <span className="grid size-[22px] place-items-center rounded-full bg-surface-3">
                <span className="size-1.5 rounded-full bg-ink-faint" />
              </span>
            )}
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <div className="flex items-start justify-between gap-3">
              <p
                className={cn('text-base font-medium', s.state === 'pending' ? 'text-ink-subtle' : 'text-ink')}
              >
                {s.label}
              </p>
              {s.action}
            </div>
            {s.description && <p className="mt-0.5 text-sm leading-relaxed text-ink-subtle">{s.description}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}
