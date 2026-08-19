import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMeasure } from '@/hooks/use-measure'

export interface BarDatum {
  label: string
  value: number
  tone?: 'brand' | 'success' | 'info' | 'warning' | 'danger' | 'ink'
}

const fills = {
  brand: 'fill-brand',
  success: 'fill-success',
  info: 'fill-info',
  warning: 'fill-warning',
  danger: 'fill-danger',
  ink: 'fill-ink',
}

export function BarChart({
  data,
  height = 180,
  className,
  formatValue = (n) => String(Math.round(n)),
  showAxis = true,
  ariaLabel,
}: {
  data: BarDatum[]
  height?: number
  className?: string
  formatValue?: (n: number) => string
  showAxis?: boolean
  ariaLabel?: string
}) {
  const [ref, { width }] = useMeasure<HTMLDivElement>()
  const [hover, setHover] = React.useState<number | null>(null)
  const pad = { top: 10, bottom: showAxis ? 20 : 2 }
  const innerH = Math.max(height - pad.top - pad.bottom, 1)
  const max = Math.max(...data.map((d) => d.value), 1) * 1.1
  const w = Math.max(width, 1)
  const slot = w / Math.max(data.length, 1)
  const barW = Math.max(Math.min(slot * 0.62, 30), 3)

  return (
    <div ref={ref} className={cn('relative w-full', className)} style={{ height }}>
      {width > 0 && (
        <svg width={w} height={height} role="img" aria-label={ariaLabel ?? 'Bar chart'}>
          <line
            x1={0}
            x2={w}
            y1={pad.top + innerH}
            y2={pad.top + innerH}
            stroke="hsl(var(--line))"
            strokeWidth={1}
          />
          {data.map((d, i) => {
            const h = Math.max((d.value / max) * innerH, d.value > 0 ? 2 : 0)
            const x = i * slot + (slot - barW) / 2
            return (
              <g key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <rect x={i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" />
                <motion.rect
                  x={x}
                  width={barW}
                  rx={Math.min(4, barW / 2)}
                  className={cn(fills[d.tone ?? 'brand'], hover === i ? 'opacity-100' : 'opacity-85')}
                  initial={{ height: 0, y: pad.top + innerH }}
                  animate={{ height: h, y: pad.top + innerH - h }}
                  transition={{ duration: 0.6, delay: Math.min(i * 0.02, 0.3), ease: [0.16, 1, 0.3, 1] }}
                />
                {showAxis && (
                  <text
                    x={i * slot + slot / 2}
                    y={height - 4}
                    textAnchor="middle"
                    className="fill-[hsl(var(--ink-faint))] text-[10px]"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
      {hover != null && data[hover] && (
        <div
          className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-lg bg-onyx px-2 py-1 text-2xs font-semibold tabular-nums text-onyx-fg shadow-lg"
          style={{ left: Math.min(Math.max(hover * slot + slot / 2, 40), w - 40) }}
        >
          {formatValue(data[hover].value)}
        </div>
      )}
    </div>
  )
}

/** Compact sparkline for stat cards and table rows. */
export function Sparkline({
  values,
  className,
  tone = 'brand',
  height = 28,
  width = 72,
  fill = true,
}: {
  values: number[]
  className?: string
  tone?: 'brand' | 'success' | 'danger' | 'ink'
  height?: number
  width?: number
  fill?: boolean
}) {
  const id = React.useId()
  if (!values.length) return null
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = max - min || 1
  const step = width / Math.max(values.length - 1, 1)
  const pts = values.map((v, i) => ({ x: i * step, y: height - 2 - ((v - min) / span) * (height - 4) }))
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const strokes = {
    brand: 'hsl(var(--brand))',
    success: 'hsl(var(--success))',
    danger: 'hsl(var(--danger))',
    ink: 'hsl(var(--ink) / 0.55)',
  }
  return (
    <svg width={width} height={height} className={className} aria-hidden>
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokes[tone]} stopOpacity="0.22" />
          <stop offset="100%" stopColor={strokes[tone]} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={`${d} L ${width},${height} L 0,${height} Z`} fill={`url(#spark-${id})`} />}
      <motion.path
        d={d}
        fill="none"
        stroke={strokes[tone]}
        strokeWidth={1.6}
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      />
    </svg>
  )
}

/** Donut for composition — usage by number type, spend by category. */
export function DonutChart({
  segments,
  size = 132,
  thickness = 14,
  className,
  center,
}: {
  segments: { label: string; value: number; color: string }[]
  size?: number
  thickness?: number
  className?: string
  center?: React.ReactNode
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - thickness) / 2
  const c = 2 * Math.PI * r

  // Pre-compute each arc's start offset so nothing is mutated mid-render.
  const arcs = segments.reduce<{ label: string; color: string; len: number; offset: number }[]>((acc, seg) => {
    const prev = acc[acc.length - 1]
    const offset = prev ? prev.offset + prev.len : 0
    return [...acc, { label: seg.label, color: seg.color, len: (seg.value / total) * c, offset }]
  }, [])

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {arcs.map((arc, i) => (
          <motion.circle
            key={arc.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${Math.max(arc.len - 3, 0)} ${c - Math.max(arc.len - 3, 0)}`}
            initial={{ strokeDashoffset: -arc.offset, opacity: 0 }}
            animate={{ strokeDashoffset: -arc.offset, opacity: 1 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          />
        ))}
      </svg>
      {center && <div className="absolute inset-0 flex flex-col items-center justify-center">{center}</div>}
    </div>
  )
}

/** Horizontal ranked bars — top destinations, top numbers by spend. */
export function RankedBars({
  items,
  formatValue,
  className,
  tone = 'brand',
}: {
  items: { label: string; value: number; sub?: string }[]
  formatValue: (n: number) => string
  className?: string
  tone?: 'brand' | 'info' | 'success'
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const bg = { brand: 'bg-brand/85', info: 'bg-info/85', success: 'bg-success/85' }
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium text-ink">{it.label}</span>
            <span className="shrink-0 tabular-nums text-ink-muted">{formatValue(it.value)}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-3">
            <motion.div
              className={cn('h-full rounded-full', bg[tone])}
              initial={{ width: 0 }}
              animate={{ width: `${(it.value / max) * 100}%` }}
              transition={{ duration: 0.7, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          {it.sub && <p className="mt-1 text-xs text-ink-faint">{it.sub}</p>}
        </li>
      ))}
    </ul>
  )
}
