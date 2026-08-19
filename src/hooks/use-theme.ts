import * as React from 'react'
import { useApp } from '@/store/app'

export function useThemeEffect() {
  const theme = useApp((s) => s.theme)

  React.useEffect(() => {
    const root = document.documentElement
    const apply = () => {
      const dark =
        theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
      root.setAttribute('data-theme', dark ? 'dark' : 'light')
      root.style.colorScheme = dark ? 'dark' : 'light'
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0e0e12' : '#ffffff')
    }
    apply()
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
}

/** Global hotkeys — ⌘K palette, and single-key jumps when no field is focused. */
export function useHotkeys(handlers: Record<string, (e: KeyboardEvent) => void>) {
  const ref = React.useRef(handlers)
  React.useEffect(() => {
    ref.current = handlers
  })

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)

      const combo = [e.metaKey || e.ctrlKey ? 'mod' : '', e.shiftKey ? 'shift' : '', e.key.toLowerCase()]
        .filter(Boolean)
        .join('+')

      const handler = ref.current[combo]
      if (handler && (!typing || combo.startsWith('mod'))) {
        e.preventDefault()
        handler(e)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
