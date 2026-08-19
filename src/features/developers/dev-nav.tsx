import { NavLink } from 'react-router-dom'
import { Activity, Key, Webhook } from 'lucide-react'
import { cn } from '@/lib/utils'

const LINKS = [
  { to: '/developers', label: 'API keys', icon: Key, end: true },
  { to: '/developers/webhooks', label: 'Webhooks', icon: Webhook },
  { to: '/developers/logs', label: 'Request logs', icon: Activity },
]

/** Contextual navigation for the developer surfaces, styled as quiet chips. */
export function DevNav() {
  return (
    <nav className="no-scrollbar -mx-1 flex items-center gap-0.5 overflow-x-auto px-1 pb-1">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            cn(
              'inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-base font-medium transition-colors',
              isActive
                ? 'bg-veil-strong text-ink [&_svg]:text-brand'
                : 'text-ink-subtle hover:text-ink [&_svg]:text-ink-faint',
            )
          }
        >
          <l.icon className="size-4" />
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
