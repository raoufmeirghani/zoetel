import * as React from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  ArrowRight,
  Banknote,
  CornerDownLeft,
  Key,
  Moon,
  Network,
  Phone,
  Plus,
  Search,
  Sun,
  Wallet,
} from 'lucide-react'
import { NAV } from './nav-config'
import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'
import { Kbd } from '@/components/ui/misc'
import { formatE164 } from '@/lib/format'
import { useI18n } from '@/lib/i18n'
import { toast } from '@/components/ui/toast'

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n()
  const navigate = useNavigate()
  const numbers = useApp((s) => s.numbers)
  const connections = useApp((s) => s.connections)
  const theme = useApp((s) => s.theme)
  const setTheme = useApp((s) => s.setTheme)
  const [query, setQuery] = React.useState('')

  const go = (to: string) => {
    onOpenChange(false)
    setQuery('')
    navigate(to)
  }

  const allNav = NAV.flatMap((g) => g.items)

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <DialogPrimitive.Portal forceMount>
            <DialogPrimitive.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-[3px] dark:bg-black/60"
              />
            </DialogPrimitive.Overlay>
            <DialogPrimitive.Content
              forceMount
              aria-label={t('Command palette')}
              className="fixed inset-x-0 top-[12vh] z-50 flex justify-center px-4 focus:outline-none"
              onClick={(e) => {
                if (e.target === e.currentTarget) onOpenChange(false)
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: -4, transition: { duration: 0.12 } }}
                transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                className="w-full max-w-[36rem] overflow-hidden rounded-2xl bg-surface shadow-pop"
              >
                <DialogPrimitive.Title className="sr-only">{t('Command palette')}</DialogPrimitive.Title>
                <Command loop className="flex flex-col">
                  <div className="flex items-center gap-2.5 border-b border-line px-4">
                    <Search className="size-4 shrink-0 text-ink-faint" />
                    <Command.Input
                      value={query}
                      onValueChange={setQuery}
                      autoFocus
                      placeholder={t('Search numbers, pages and actions…')}
                      className="h-13 flex-1 bg-transparent text-md text-ink placeholder:text-ink-faint focus:outline-none"
                    />
                    <Kbd className="shrink-0">Esc</Kbd>
                  </div>

                  <Command.List className="max-h-[min(56vh,26rem)] overflow-y-auto overscroll-contain p-2">
                    <Command.Empty className="py-10 text-center text-base text-ink-subtle">
                      {t('No results for')} “{query}”
                    </Command.Empty>

                    <Group heading={t('Actions')}>
                      <Item icon={<Plus />} onSelect={() => go('/numbers/buy')} shortcut="B">
                        {t('Buy a phone number')}
                      </Item>
                      <Item icon={<Network />} onSelect={() => go('/sip?new=1')}>
                        {t('Create a SIP connection')}
                      </Item>
                      <Item icon={<Wallet />} onSelect={() => go('/billing?topup=1')}>
                        {t('Add funds to wallet')}
                      </Item>
                      <Item icon={<Key />} onSelect={() => go('/developers?new=1')}>
                        {t('Generate an API key')}
                      </Item>
                      <Item
                        icon={theme === 'dark' ? <Sun /> : <Moon />}
                        onSelect={() => {
                          setTheme(theme === 'dark' ? 'light' : 'dark')
                          onOpenChange(false)
                        }}
                      >
                        {theme === 'dark' ? t('Switch to light appearance') : t('Switch to dark appearance')}
                      </Item>
                    </Group>

                    <Group heading={t('Go to')}>
                      {allNav.map((item) => (
                        <Item
                          key={item.to}
                          icon={<item.icon weight="fill" />}
                          onSelect={() => go(item.to)}
                          hint={item.description && t(item.description)}
                        >
                          {t(item.label)}
                        </Item>
                      ))}
                      <Item icon={<Banknote />} onSelect={() => go('/pricing')}>
                        {t('Pricing')}
                      </Item>
                    </Group>

                    {numbers.length > 0 && (
                      <Group heading={t('Your numbers')}>
                        {numbers.slice(0, 6).map((n) => (
                          <Item
                            key={n.id}
                            icon={<Phone />}
                            onSelect={() => go(`/numbers/${n.id}`)}
                            hint={n.label ?? n.city}
                            value={`${n.e164} ${n.label ?? ''} ${n.city}`}
                          >
                            <span className="tabular-nums">{formatE164(n.e164)}</span>
                          </Item>
                        ))}
                      </Group>
                    )}

                    {connections.length > 0 && (
                      <Group heading={t('SIP connections')}>
                        {connections.slice(0, 5).map((c) => (
                          <Item
                            key={c.id}
                            icon={<Network />}
                            onSelect={() => go(`/sip/${c.id}`)}
                            hint={c.region}
                          >
                            {c.name}
                          </Item>
                        ))}
                      </Group>
                    )}

                    <Group heading={t('Support')}>
                      <Item
                        icon={<ArrowRight />}
                        onSelect={() => {
                          onOpenChange(false)
                          toast.success('A support engineer will reply within 2 hours', {
                            description: 'Ticket #48213 opened for Acme Retail.',
                          })
                        }}
                      >
                        {t('Contact support')}
                      </Item>
                    </Group>
                  </Command.List>

                  <div className="flex items-center justify-between border-t border-line bg-surface-2 px-3 py-2 text-2xs text-ink-faint">
                    <span className="flex items-center gap-1.5">
                      <CornerDownLeft className="size-3" /> to select
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Kbd>↑</Kbd>
                        <Kbd>↓</Kbd> navigate
                      </span>
                    </span>
                  </div>
                </Command>
              </motion.div>
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        )}
      </AnimatePresence>
    </DialogPrimitive.Root>
  )
}

function Group({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <Command.Group
      heading={heading}
      className={cn(
        '[&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2.5',
        '[&_[cmdk-group-heading]]:text-2xs [&_[cmdk-group-heading]]:font-semibold',
        '[&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-faint',
      )}
    >
      {children}
    </Command.Group>
  )
}

function Item({
  children,
  icon,
  onSelect,
  hint,
  shortcut,
  value,
}: {
  children: React.ReactNode
  icon?: React.ReactNode
  onSelect: () => void
  hint?: string
  shortcut?: string
  value?: string
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      value={value}
      className={cn(
        'flex cursor-default select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-base text-ink',
        'data-[selected=true]:bg-surface-3',
        '[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-ink-faint data-[selected=true]:[&_svg]:text-ink-muted',
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {hint && <span className="hidden shrink-0 truncate text-xs text-ink-faint sm:block">{hint}</span>}
      {shortcut && <Kbd>{shortcut}</Kbd>}
    </Command.Item>
  )
}
