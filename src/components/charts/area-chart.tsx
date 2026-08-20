import * as React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useMeasure } from '@/hooks/use-measure'

export interface Point {
  label: string
  value: number
  secondary?: number
  meta?: string
}

const EASE = [0.16, 1, 0.3, 1] as const

function buildPath(points: { x: number; y: number }[], smoothing = 0.18) {
  if (points.length < 2) return ''
  const line = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    return { len, angle: Math.atan2(b.y - a.y, b.x - a.x) }
  }
  const control = (cur: { x: number; y: number }, prev: typeof cur, next: typeof cur, reverse?: boolean) => {
    const p = prev || cur
    const n = next || cur
    const o = line(p, n)
    const angle = o.angle + (reverse ? Math.PI : 0)
    const length = o.len * smoothing
    return { x: cur.x + Math.cos(angle) * length, y: cur.y + Math.sin(angle) * length }
  }
  return points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`
    const cps = control(arr[i - 1], arr[i - 2], point)
    const cpe = control(point, arr[i - 1], arr[i + 1], true)
    return `${acc} C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`
  }, '')
}

export function AreaChart({
  data,
  height = 200,
  className,
  formatValue = (n) => String(Math.round(n)),
  formatSecondary,
  showAxis = true,
  tone = 'brand',
  secondaryTone = 'ink',
  gridLines = 4,
  onHoverChange,
  ariaLabel,
}: {
  data: Point[]
  height?: number
  className?: string
  formatValue?: (n: number) => string
  formatSecondary?: (n: number) => string
  showAxis?: boolean
  tone?: 'brand' | 'success' | 'info'
  secondaryTone?: 'ink' | 'info'
  gridLines?: number
  onHoverChange?: (index: number | null) => void
  ariaLabel?: string
}) {
  const [ref, { width }] = useMeasure<HTMLDivElement>()
  const [hover, setHover] = React.useState<number | null>(null)
  const reduce = useReducedMotion()
  const gradId = React.useId()

  const pad = { top: 12, right: 4, bottom: showAxis ? 22 : 4, left: 4 }
  const w = Math.max(width, 1)
  const innerW = Math.max(w - pad.left - pad.right, 1)
  const innerH = Math.max(height - pad.top - pad.bottom, 1)

  const hasSecondary = data.some((d) => d.secondary != null)
  const max = Math.max(...data.map((d) => Math.max(d.value, d.secondary ?? 0)), 1) * 1.12
  const step = data.length > 1 ? innerW / (data.length - 1) : 0

  const toXY = (v: number, i: number) => ({
    x: pad.left + i * step,
    y: pad.top + innerH - (v / max) * innerH,
  })

  const pts = data.map((d, i) => toXY(d.value, i))
  const secPts = hasSecondary ? data.map((d, i) => toXY(d.secondary ?? 0, i)) : []
  const linePath = buildPath(pts)
  const areaPath = pts.length
    ? `${linePath} L ${pts[pts.length - 1].x},${pad.top + innerH} L ${pts[0].x},${pad.top + innerH} Z`
    : ''

  const strokes = { brand: 'hsl(var(--brand))', success: 'hsl(var(--success))', info: 'hsl(var(--info))' }
  const stroke = strokes[tone]
  const secStroke = secondaryTone === 'info' ? 'hsl(var(--info))' : 'hsl(var(--ink) / 0.28)'

  const setHoverIdx = (i: number | null) => {
    setHover(i)
    onHoverChange?.(i)
  }

  const active = hover != null ? data[hover] : null
  const activePt = hover != null ? pts[hover] : null
  const tipLeft = activePt ? Math.min(Math.max(activePt.x, 62), w - 62) : 0

  const axisEvery = Math.max(1, Math.ceil(data.length / (w < 420 ? 4 : w < 760 ? 6 : 9)))

  return (
    <div ref={ref} className={cn('relative w-full select-none', className)} style={{ height }}>
      {width > 0 && (
        <>
          <svg
            style={{ direction: 'ltr' }}
            width={w}
            height={height}
            role="img"
            aria-label={ariaLabel ?? 'Trend chart'}
            className="overflow-visible"
            onMouseLeave={() => setHoverIdx(null)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left - pad.left
              const i = Math.round(x / (step || 1))
              setHoverIdx(Math.min(data.length - 1, Math.max(0, i)))
            }}
            onTouchMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.touches[0].clientX - rect.left - pad.left
              const i = Math.round(x / (step || 1))
              setHoverIdx(Math.min(data.length - 1, Math.max(0, i)))
            }}
            onTouchEnd={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id={`area-${gradId}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity="0.20" />
                <stop offset="62%" stopColor={stroke} stopOpacity="0.05" />
                <stop offset="100%" stopColor={stroke} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* gridLines={0} means "no grid" — without the guard the divide
                below is by zero and every y comes out NaN. */}
            {Array.from({ length: gridLines > 0 ? gridLines + 1 : 0 }).map((_, i) => {
              const y = pad.top + (innerH / gridLines) * i
              return (
                <line
                  key={i}
                  x1={pad.left}
                  x2={w - pad.right}
                  y1={y}
                  y2={y}
                  stroke="hsl(var(--line))"
                  strokeWidth={1}
                  strokeDasharray={i === gridLines ? undefined : '2 4'}
                  opacity={i === gridLines ? 1 : 0.75}
                />
              )
            })}

            <motion.path
              d={areaPath}
              fill={`url(#area-${gradId})`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            />

            {hasSecondary && (
              <motion.path
                d={buildPath(secPts)}
                fill="none"
                stroke={secStroke}
                strokeWidth={1.5}
                strokeDasharray="3 3"
                strokeLinecap="round"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: EASE }}
              />
            )}

            <motion.path
              d={linePath}
              fill="none"
              stroke={stroke}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: reduce ? 1 : 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.1, ease: EASE }}
            />

            {activePt && (
              <>
                <line
                  x1={activePt.x}
                  x2={activePt.x}
                  y1={pad.top}
                  y2={pad.top + innerH}
                  stroke="hsl(var(--ink) / 0.18)"
                  strokeWidth={1}
                />
                <circle cx={activePt.x} cy={activePt.y} r={5.5} fill="hsl(var(--surface))" />
                <circle cx={activePt.x} cy={activePt.y} r={3.5} fill={stroke} />
              </>
            )}

            {showAxis &&
              data.map((d, i) =>
                (i % axisEvery === 0 && i < data.length - Math.ceil(axisEvery * 0.6)) ||
                i === data.length - 1 ? (
                  <text
                    key={i}
                    x={pad.left + i * step}
                    y={height - 4}
                    textAnchor={i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle'}
                    className="fill-[hsl(var(--ink-faint))] text-[10px]"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {d.label}
                  </text>
                ) : null,
              )}
          </svg>

          {active && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl bg-onyx px-2.5 py-1.5 text-onyx-fg shadow-lg"
              style={{ left: tipLeft, top: 0 }}
            >
              <p className="text-[10px] font-medium uppercase tracking-wider opacity-60">{active.label}</p>
              <p className="text-sm font-semibold tabular-nums">{formatValue(active.value)}</p>
              {active.secondary != null && formatSecondary && (
                <p className="text-[11px] tabular-nums opacity-70">{formatSecondary(active.secondary)}</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
