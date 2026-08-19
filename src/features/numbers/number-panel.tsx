import { Tag, Trash2, TriangleAlert } from 'lucide-react'
import * as React from 'react'
import { Link } from 'react-router-dom'
import { SidePanel } from '@/components/canvas/side-panel'
import { ConfigTabs } from '@/components/canvas/config-tabs'
import { Button } from '@/components/ui/button'
import { StatusDot } from '@/components/ui/status'
import { CopyButton } from '@/components/ui/misc'
import { CapabilityPills } from '@/components/shared/capability-pills'
import { CarrierAvatar } from '@/components/shared/carrier-avatar'
import { NUMBER_TYPE_META } from '@/lib/data/countries'
import { formatE164, money } from '@/lib/format'
import { useApp } from '@/store/app'
import { useNumberConfigSections, RenameNumberDrawer } from './config-drawers'
import type { OwnedNumber } from '@/lib/types'

/**
 * Settings for one number, in place. Wrapped so the inner body can be keyed on
 * the number's id — form drafts belong to a single record, so switching rows
 * remounts rather than reconciles.
 */
export function NumberPanel({ number, onClose }: { number?: OwnedNumber; onClose: () => void }) {
  return (
    <SidePanel
      open={!!number}
      onClose={onClose}
      eyebrow={
        number && (
          <>
            <StatusDot
              tone={
                number.status === 'active' ? 'success' : number.status === 'suspended' ? 'danger' : 'warning'
              }
              pulse={number.status === 'active'}
            />
            <span className="eyebrow">
              {number.status === 'active' ? 'Live' : number.status.replace(/_/g, ' ')}
            </span>
            <span className="text-ink-faint" aria-hidden>
              ·
            </span>
            <span className="eyebrow">
              {NUMBER_TYPE_META[number.type].label} · {number.city}
            </span>
          </>
        )
      }
      title={number ? (number.label ?? formatE164(number.e164)) : ''}
      subtitle={number?.label ? formatE164(number.e164) : undefined}
      fullHref={number ? `/numbers/${number.id}` : undefined}
      fullLabel="Open full details"
    >
      {number && <NumberPanelBody key={number.id} number={number} />}
    </SidePanel>
  )
}

function NumberPanelBody({ number }: { number: OwnedNumber }) {
  const sections = useNumberConfigSections(number)
  const currency = useApp((s) => s.workspace.currency)
  const [renaming, setRenaming] = React.useState(false)

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <CarrierAvatar carrier={number.carrier} size="sm" showName />
        <span className="text-ink-faint" aria-hidden>
          ·
        </span>
        <CapabilityPills capabilities={number.capabilities} size="sm" />
        <span className="text-xs text-ink-faint">{money(number.monthly, currency)}/mo</span>
        <CopyButton value={number.e164} size="icon-xs" className="ml-auto" />
        <Button variant="ghost" size="xs" icon={<Tag />} onClick={() => setRenaming(true)}>
          {number.label ? 'Rename' : 'Label'}
        </Button>
      </div>

      {number.status === 'pending_verification' && (
        <div className="mb-6 flex gap-3 rounded-2xl bg-warning-soft p-4">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-warning-ink">Reserved, but not yet routable</p>
            <p className="mt-1 text-xs leading-relaxed text-warning-ink/85">
              You aren't billed while it's held. Verification unlocks it.
            </p>
            <Button size="xs" variant="secondary" asChild className="mt-2.5">
              <Link to="/verification">Complete verification</Link>
            </Button>
          </div>
        </div>
      )}

      <ConfigTabs sections={sections} layout="stacked" layoutId={`num-panel-${number.id}`} />

      <div className="mt-10 border-t border-line-soft pt-5">
        <Button variant="destructive-quiet" size="xs" icon={<Trash2 />} asChild>
          <Link to={`/numbers/${number.id}`}>Release this number</Link>
        </Button>
      </div>

      <RenameNumberDrawer open={renaming} number={number} onClose={() => setRenaming(false)} />
    </>
  )
}
