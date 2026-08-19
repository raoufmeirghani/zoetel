import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { clamp } from '@/lib/utils'

export function Progress({
  value,
  className,
  tone = 'brand',
  size = 'md',
  showLabel,
  label,
}: {
  value: number
  className?: string
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'ink'
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
  label?: React.ReactNode
}) {
  const pct = clamp(value, 0, 100)
  const tones = {
    brand: 'bg-brand',
    success: 'bg-success',
    warning: 'bg-warning',
    danger: 'bg-danger',
    ink: 'bg-ink',
  }
  const heights = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' }
  return (
    <div className={className}>
      {(showLabel || label) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          <span className="text-ink-muted">{label}</span>
          {showLabel && <span className="font-medium tabular-nums text-ink">{Math.round(pct)}%</span>}
        </div>
      )}
      <div
        className={cn('w-full overflow-hidden rounded-full bg-surface-3', heights[size])}
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn('h-full rounded-full', tones[tone])}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 150, damping: 26 }}
        />
      </div>
    </div>
  )
}

/** Circular progress — used for KYC completion and quota rings. */
export function ProgressRing({
  value,
  size = 44,
  strokeWidth = 4,
  tone = 'brand',
  children,
  className,
}: {
  value: number
  size?: number
  strokeWidth?: number
  tone?: 'brand' | 'success' | 'warning' | 'danger'
  children?: React.ReactNode
  className?: string
}) {
  const reduce = useReducedMotion()
  const pct = clamp(value, 0, 100)
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const tones = {
    brand: 'stroke-brand',
    success: 'stroke-success',
    warning: 'stroke-warning',
    danger: 'stroke-danger',
  }
  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          className="stroke-surface-3"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={tones[tone]}
          fill="none"
          strokeDasharray={c}
          initial={{ strokeDashoffset: reduce ? c - (pct / 100) * c : c }}
          animate={{ strokeDashoffset: c - (pct / 100) * c }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}

/** Usage meter with threshold colouring — wallet balance, channel limits, quotas. */
export function UsageMeter({
  label,
  used,
  total,
  unit,
  formatValue,
  className,
  hint,
}: {
  label: string
  used: number
  total: number
  unit?: string
  formatValue?: (n: number) => string
  className?: string
  hint?: React.ReactNode
}) {
  const ratio = total > 0 ? (used / total) * 100 : 0
  const tone = ratio > 90 ? 'danger' : ratio > 72 ? 'warning' : 'brand'
  const fmt = formatValue ?? ((n: number) => n.toLocaleString('en-US'))
  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium text-ink-muted">{label}</span>
        <span className="text-sm tabular-nums text-ink">
          <span className="font-semibold">{fmt(used)}</span>
          <span className="text-ink-faint">
            {' / '}
            {fmt(total)}
            {unit ? ` ${unit}` : ''}
          </span>
        </span>
      </div>
      <Progress value={ratio} tone={tone} size="sm" />
      {hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  )
}
