import { NavLink } from 'react-router-dom'
import { Activity, Key, Webhook } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRailFade } from '@/hooks/use-media'
import { useI18n } from '@/lib/i18n'

const LINKS = [
  { to: '/developers', label: 'API keys', icon: Key, end: true },
  { to: '/developers/webhooks', label: 'Webhooks', icon: Webhook },
  { to: '/developers/logs', label: 'Request logs', icon: Activity },
]

/** Contextual navigation for the developer surfaces, styled as quiet chips. */
export function DevNav() {
  const { t } = useI18n()
  const rail = useRailFade<HTMLElement>()
  return (
    <nav
      ref={rail}
      className="no-scrollbar rail-fade -mx-1 flex items-center gap-0.5 overflow-x-auto px-1 py-1"
    >
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            cn(
              'inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3.5 text-base font-medium transition-colors sm:h-auto sm:px-3 sm:py-1.5',
              isActive
                ? 'bg-veil-strong text-ink [&_svg]:text-brand'
                : 'text-ink-subtle hover:text-ink [&_svg]:text-ink-faint',
            )
          }
        >
          <l.icon className="size-4" />
          {t(l.label)}
        </NavLink>
      ))}
    </nav>
  )
}
