import { ArrowUpRight, ShieldCheck, Terminal } from 'lucide-react'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { SidePanel } from '@/components/canvas/side-panel'
import { ConfigTabs } from '@/components/canvas/config-tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusDot } from '@/components/ui/status'
import { useApp } from '@/store/app'
import { num } from '@/lib/format'
import { SipRegisterDrawer, useSipConfigSections } from './config-drawers'
import type { SipConnection } from '@/lib/types'

const TONE = {
  active: 'success',
  degraded: 'warning',
  provisioning: 'info',
  offline: 'danger',
} as const

/** Settings for one trunk, in place — the list stays put behind it. */
export function SipPanel({ conn, onClose }: { conn?: SipConnection; onClose: () => void }) {
  return (
    <SidePanel
      open={!!conn}
      onClose={onClose}
      eyebrow={
        conn && (
          <>
            <StatusDot tone={TONE[conn.status] ?? 'neutral'} pulse={conn.status === 'provisioning'} />
            <span className="eyebrow capitalize">{conn.status}</span>
            <span className="text-ink-faint" aria-hidden>
              ·
            </span>
            <span className="eyebrow">
              {conn.region} · {conn.transport.toUpperCase()}
            </span>
          </>
        )
      }
      title={conn?.name ?? ''}
      subtitle={conn ? `${conn.concurrentCalls} of ${conn.channelLimit} channels in use` : undefined}
      fullHref={conn ? `/sip/${conn.id}` : undefined}
      fullLabel="Open full details"
    >
      {conn && <SipPanelBody key={conn.id} conn={conn} />}
    </SidePanel>
  )
}

function SipPanelBody({ conn }: { conn: SipConnection }) {
  const sections = useSipConfigSections(conn)
  const numbers = useApp((s) => s.numbers)
  const assigned = numbers.filter((n) => n.connectionId === conn.id)
  const [registering, setRegistering] = React.useState(false)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {conn.srtp && (
          <Badge tone="outline" size="sm">
            <ShieldCheck />
            SRTP
          </Badge>
        )}
        <Badge tone="neutral" size="sm">
          {num(conn.stats.minutes)} min this month
        </Badge>
        <Button
          variant="ghost"
          size="xs"
          icon={<Terminal />}
          onClick={() => setRegistering(true)}
          className="ml-auto"
        >
          Register a PBX
        </Button>
      </div>

      <ConfigTabs sections={sections} layout="stacked" layoutId={`sip-panel-${conn.id}`} />

      <div className="mt-10 border-t border-line-soft pt-5">
        <Link
          to="/numbers"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-brand-ink"
        >
          {assigned.length} {assigned.length === 1 ? 'number' : 'numbers'} routed here
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <SipRegisterDrawer open={registering} conn={conn} onClose={() => setRegistering(false)} />
    </>
  )
}
