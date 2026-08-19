import * as React from 'react'
import { animate, useReducedMotion } from 'framer-motion'

export function AnimatedNumber({
  value,
  format,
  duration = 0.9,
  className,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
  className?: string
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const prev = React.useRef(0)
  const reduce = useReducedMotion()
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString('en-US'))

  React.useEffect(() => {
    const node = ref.current
    if (!node) return
    if (reduce) {
      node.textContent = fmt(value)
      prev.current = value
      return
    }
    const controls = animate(prev.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = fmt(v)
      },
      onComplete: () => {
        prev.current = value
      },
    })
    return () => controls.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, reduce])

  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  )
}
