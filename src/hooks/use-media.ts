import * as React from 'react'

/**
 * Subscribes to a media query.
 *
 * Some layout decisions cannot be made in CSS: whether a panel is a slide-over
 * or a bottom sheet changes which element the drag gesture is bound to, which
 * transition plays, and whether the page behind it is locked. Those are
 * behavioural, so the breakpoint has to reach JavaScript.
 *
 * Everything that *can* be done with a Tailwind variant still is — this is for
 * the cases where the component's behaviour differs, not just its appearance.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia(query).matches,
  )

  React.useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches)
    setMatches(mql.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/**
 * True below Tailwind's `sm` breakpoint — a phone held in one hand.
 *
 * Kept as one named hook rather than a raw query at each call site so the
 * definition of "handheld" cannot drift between components.
 */
export function useIsHandheld(): boolean {
  return useMediaQuery('(max-width: 639px)')
}

/** True below `lg`, where the nav rail is replaced by the dock. */
export function useIsCompact(): boolean {
  return useMediaQuery('(max-width: 1023px)')
}

/**
 * Marks a horizontal rail as fully scrolled.
 *
 * Pairs with the `.rail-fade` utility: the mask hints that there is more to the
 * side, and this removes the hint once there isn't. Without it the fade sits
 * permanently over the last tab, which reads as a rendering artefact rather than
 * as an affordance.
 */
export function useRailFade<T extends HTMLElement>() {
  const ref = React.useRef<T>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const slack = el.scrollWidth - el.clientWidth
      const atEnd = slack <= 1 || Math.abs(el.scrollLeft) >= slack - 1
      el.dataset.atEnd = String(atEnd)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', update)
      ro.disconnect()
    }
  }, [])

  return ref
}
