import type * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * The Zoetel mark — an abstract "Z" cut from three offset bars. Sourced from
 * the brand's official icon SVG, redrawn with `currentColor` fills so a
 * single glyph can serve every surface instead of shipping separate
 * black/white image assets.
 */
function IconGlyph({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 29 29" fill="none" className={className} style={style} aria-hidden>
      <path
        d="M17.6892 5.43328C17.8693 5.20755 18.1424 5.07608 18.4311 5.07608H22.5299C23.3256 5.07608 23.7681 5.99641 23.2712 6.61792L10.4763 22.6212C10.2962 22.8465 10.0234 22.9777 9.73501 22.9777H5.66335C4.86808 22.9777 4.42543 22.0583 4.92141 21.4366L17.6892 5.43328Z"
        fill="currentColor"
      />
      <path
        d="M8.73999 5.36834C8.91974 5.13601 9.19693 5 9.49068 5H13.1399C13.9297 5 14.374 5.90829 13.8892 6.53175L9.30996 12.4209C9.13014 12.6522 8.85362 12.7874 8.56068 12.7874H4.93436C4.14567 12.7874 3.70105 11.8813 4.18367 11.2575L8.73999 5.36834Z"
        fill="currentColor"
      />
      <path
        d="M19.3563 22.6298C19.1765 22.8621 18.8994 22.9981 18.6056 22.9981H14.9564C14.1666 22.9981 13.7223 22.0899 14.2071 21.4664L18.7863 15.5772C18.9661 15.346 19.2427 15.2107 19.5356 15.2107H23.1619C23.9506 15.2107 24.3952 16.1168 23.9126 16.7406L19.3563 22.6298Z"
        fill="currentColor"
      />
    </svg>
  )
}

/**
 * `tone="auto"` (default) reads dark on light chrome and flips to white in
 * dark mode — right for the rail, mobile pill and canvas surfaces. Pass
 * `tone="onDark"` when the mark sits on a surface that's always dark
 * regardless of theme (e.g. the onboarding brand rail).
 */
export function Logo({
  className,
  size = 28,
  tone = 'auto',
}: {
  className?: string
  size?: number
  tone?: 'auto' | 'onDark'
}) {
  return (
    <IconGlyph
      className={cn(tone === 'onDark' ? 'text-white' : 'text-ink dark:text-white', className)}
      style={{ width: size, height: size } as React.CSSProperties}
    />
  )
}

export function Wordmark({ className, tone = 'auto' }: { className?: string; tone?: 'auto' | 'onDark' }) {
  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Logo tone={tone} />
      <span
        className={cn('headline text-[15px] tracking-[-0.02em]', tone === 'onDark' ? 'text-white' : 'text-ink')}
      >
        Zoetel
      </span>
    </span>
  )
}
