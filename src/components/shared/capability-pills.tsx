import { MessageSquare, Phone, Printer, Image } from 'lucide-react'
import type { Capability } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'
import { COUNTRIES } from '@/lib/data/countries'
import { useI18n } from '@/lib/i18n'

const CAP_ICON = {
  voice: Phone,
  sms: MessageSquare,
  mms: Image,
  fax: Printer,
} as const

const CAP_LABEL = { voice: 'Voice', sms: 'SMS', mms: 'MMS', fax: 'Fax' } as const

export function CapabilityPills({
  capabilities,
  className,
  size = 'md',
}: {
  capabilities: Capability[]
  className?: string
  size?: 'sm' | 'md'
}) {
  const all: Capability[] = ['voice', 'sms', 'mms', 'fax']
  return (
    <div className={cn('flex items-center gap-1', className)}>
      {all.map((cap) => {
        const on = capabilities.includes(cap)
        const Icon = CAP_ICON[cap]
        return (
          <Tooltip key={cap} content={`${CAP_LABEL[cap]}${on ? '' : ' — not available'}`}>
            <span
              className={cn(
                'grid place-items-center rounded-md transition-colors',
                size === 'sm' ? 'size-5' : 'size-6',
                on ? 'bg-brand-soft text-brand-ink' : 'bg-veil-strong text-ink-faint/45',
              )}
            >
              <Icon className={size === 'sm' ? 'size-3' : 'size-3.5'} />
            </span>
          </Tooltip>
        )
      })}
    </div>
  )
}

export function CountryFlag({
  code,
  className,
  showName,
}: {
  code: string
  className?: string
  showName?: boolean
}) {
  const { t } = useI18n()
  const c = COUNTRIES.find((x) => x.code === code)
  if (!c) return null
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="text-base leading-none">{c.flag}</span>
      {showName && <span>{t(c.name)}</span>}
    </span>
  )
}
