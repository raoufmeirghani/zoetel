import * as React from 'react'
import { cn } from '@/lib/utils'
import type { CarrierId } from '@/lib/types'

interface Carrier {
  name: string
  src: string
  /**
   * Some marks are drawn edge-to-edge in their own artwork and need insetting so
   * they optically match the ones that carry their own padding.
   */
  inset?: string
}

/**
 * Carrier marks, local rather than hot-linked: the upstream CDNs are unreliable
 * (Vodafone's returns a bot wall for direct requests) and a logo that fails to
 * load leaves a hole in every row. WE ships as a square SVG; Vodafone's official
 * file is the full wordmark, so its viewBox is cropped to the leading speechmark;
 * Etisalat is a 400px raster re-encoded to WebP.
 */
export const CARRIERS: Record<CarrierId, Carrier> = {
  we: { name: 'WE', src: '/carriers/we.svg' },
  vodafone: { name: 'Vodafone', src: '/carriers/vodafone.svg', inset: 'p-[3px]' },
  etisalat: { name: 'Etisalat', src: '/carriers/etisalat.webp' },
}

const SIZES = {
  xs: 'size-5',
  sm: 'size-6',
  md: 'size-8',
  lg: 'size-10',
} as const

/**
 * The carrier a number belongs to, as a circular mark. No plate behind it — the
 * logos carry their own colour, and a tinted disc under them would fight the
 * glass surfaces they sit on.
 */
export function CarrierAvatar({
  carrier,
  size = 'md',
  className,
  showName,
}: {
  /** Tolerates undefined: a localStorage snapshot can predate this field. */
  carrier?: CarrierId
  size?: keyof typeof SIZES
  className?: string
  /** Renders the carrier's name beside the mark. */
  showName?: boolean
}) {
  const c = carrier ? CARRIERS[carrier] : undefined
  const [failed, setFailed] = React.useState(false)

  if (!c) return null

  const mark = failed ? (
    // Initials rather than a broken-image glyph, so a row never loses its shape.
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-veil-strong text-2xs font-semibold text-ink-muted',
        SIZES[size],
        className,
      )}
      aria-hidden
    >
      {c.name.slice(0, 2)}
    </span>
  ) : (
    <img
      src={c.src}
      alt=""
      aria-hidden
      onError={() => setFailed(true)}
      className={cn('shrink-0 rounded-full object-contain', SIZES[size], c.inset, className)}
    />
  )

  if (!showName) {
    return (
      <span className="contents" title={c.name}>
        {mark}
        <span className="sr-only">{c.name}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      {mark}
      <span className="truncate text-sm text-ink-muted">{c.name}</span>
    </span>
  )
}

/** The carrier's display name, for places that want text without the mark. */
export function carrierName(carrier: CarrierId): string {
  return CARRIERS[carrier].name
}
