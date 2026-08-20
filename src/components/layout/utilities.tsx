import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Banknote,
  Key,
  Languages,
  LifeBuoy,
  LogOut,
  Monitor,
  Moon,
  Network,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sun,
} from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'
import {
  Menu,
  MenuContent,
  MenuItem,
  MenuLabel,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuTrigger,
} from '@/components/ui/menu'
import { NotificationBell } from './notifications'
import { useApp, type Theme } from '@/store/app'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'
import { Kbd } from '@/components/ui/misc'
import { LOCALES, useI18n, type Locale } from '@/lib/i18n'

/**
 * Floating utility cluster: global actions, search and account. Deliberately not
 * a top bar — it sits over the hero so no horizontal line cuts the page in half.
 */
export function TopUtilities({ className, onOpenSearch }: { className?: string; onOpenSearch: () => void }) {
  const profile = useApp((s) => s.profile)
  const workspace = useApp((s) => s.workspace)
  const theme = useApp((s) => s.theme)
  const setTheme = useApp((s) => s.setTheme)
  const resetOnboarding = useApp((s) => s.resetOnboarding)
  const stage = useApp((s) => s.verification.stage)
  const navigate = useNavigate()
  const { t, locale, setLocale } = useI18n()
  const [env, setEnv] = React.useState<'live' | 'test'>('live')

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* ── Create ─────────────────────────────────── */}
      <Menu>
        <MenuTrigger asChild>
          <button
            className="chrome inline-flex h-11 items-center gap-1.5 rounded-full pe-3.5 ps-3 text-sm font-medium text-ink transition-colors hover:bg-veil-strong sm:h-9 sm:pe-3 sm:ps-2.5"
            aria-label={t('Create')}
          >
            <Plus className="size-4 text-brand" />
            <span className="hidden sm:inline">{t('New')}</span>
          </button>
        </MenuTrigger>
        <MenuContent className="w-60">
          <MenuLabel>{t('Create')}</MenuLabel>
          <MenuItem onSelect={() => navigate('/numbers/buy')} shortcut="B">
            <Phone />
            {t('Phone number')}
          </MenuItem>
          <MenuItem onSelect={() => navigate('/sip?new=1')}>
            <Network />
            {t('SIP connection')}
          </MenuItem>
          <MenuItem onSelect={() => navigate('/developers?new=1')}>
            <Key />
            {t('API key')}
          </MenuItem>
          <MenuSeparator />
          <MenuItem onSelect={() => navigate('/billing?topup=1')}>
            <Banknote />
            {t('Add funds to wallet')}
          </MenuItem>
        </MenuContent>
      </Menu>

      {/* ── Search ─────────────────────────────────── */}
      <Tooltip content={t('Search or jump to…')}>
        <button
          onClick={onOpenSearch}
          className="chrome inline-flex h-11 items-center gap-2 rounded-full px-3.5 text-ink-subtle transition-colors hover:bg-veil-strong hover:text-ink sm:h-9 sm:px-3"
          aria-label={t('Search')}
        >
          <Search className="size-4" />
          <Kbd className="hidden bg-transparent shadow-none lg:inline-flex">⌘K</Kbd>
        </button>
      </Tooltip>

      {stage !== 'approved' && (
        <Tooltip content={t('Verification unlocks every number range')}>
          <Link
            to="/verification"
            className={cn(
              'chrome hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors md:inline-flex',
              stage === 'rejected' ? 'text-danger-ink' : 'text-warning-ink',
            )}
          >
            <ShieldCheck className="size-3.5" />
            {stage === 'in_review' ? t('In review') : t('Verify account')}
          </Link>
        </Tooltip>
      )}

      {/* ── Environment ────────────────────────────── */}
      <div className="chrome hidden h-9 items-center gap-0.5 rounded-full p-0.5 sm:flex">
        {(['live', 'test'] as const).map((e) => (
          <button
            key={e}
            onClick={() => setEnv(e)}
            className={cn(
              'relative h-8 rounded-full px-2.5 text-xs font-medium capitalize transition-colors',
              env === e ? 'text-ink' : 'text-ink-faint hover:text-ink-muted',
            )}
          >
            {env === e && <span className="absolute inset-0 rounded-full bg-veil-strong" aria-hidden />}
            <span className="relative flex items-center gap-1.5">
              {e === 'live' && (
                <span className={cn('size-1.5 rounded-full', env === 'live' ? 'bg-success' : 'bg-ink-faint')} />
              )}
              {t(e === 'live' ? 'Live' : 'Test')}
            </span>
          </button>
        ))}
      </div>

      <div className="chrome grid h-11 place-items-center rounded-full px-1 sm:h-9 sm:px-0.5">
        <NotificationBell />
      </div>

      {/* ── Account ────────────────────────────────── */}
      <Menu>
        <MenuTrigger asChild>
          <button
            className="chrome grid size-11 place-items-center rounded-full transition-opacity hover:opacity-85 sm:size-9"
            aria-label={t('Account')}
          >
            <Avatar name={profile.name} hue={profile.avatarHue} size="md" className="!size-7" />
          </button>
        </MenuTrigger>
        <MenuContent className="w-64">
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <Avatar name={profile.name} hue={profile.avatarHue} size="lg" />
            <div className="min-w-0">
              <p className="truncate text-base font-medium text-ink">{profile.name}</p>
              <p className="truncate text-xs text-ink-subtle">{profile.email}</p>
            </div>
          </div>
          <MenuSeparator />
          <MenuLabel>{t('Workspace')}</MenuLabel>
          <MenuItem onSelect={() => navigate('/settings')}>
            <span
              className="grid size-4 shrink-0 place-items-center rounded-[5px] text-[8px] font-semibold text-white"
              style={{ background: 'linear-gradient(150deg, hsl(174 62% 42%), hsl(196 72% 34%))' }}
            >
              {workspace.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 truncate">{workspace.name}</span>
            <span className="text-2xs text-ink-faint">
              {workspace.plan === 'payg' ? t('Pay as you go') : t('Volume')}
            </span>
          </MenuItem>
          <MenuSeparator />
          <MenuItem onSelect={() => navigate('/settings')}>
            <Settings />
            {t('Account settings')}
          </MenuItem>
          <MenuItem onSelect={() => navigate('/verification')}>
            <ShieldCheck />
            {t('Verification')}
          </MenuItem>
          <MenuSeparator />
          <MenuLabel>{t('Language')}</MenuLabel>
          {/* Language and direction are one choice: picking Arabic mirrors the
              product. It lives beside the theme because both are personal
              display preferences rather than workspace settings. */}
          <MenuRadioGroup value={locale} onValueChange={(v) => setLocale(v as Locale)}>
            {(Object.keys(LOCALES) as Locale[]).map((l) => (
              <MenuRadioItem key={l} value={l}>
                <Languages />
                <span className="flex-1">{LOCALES[l].native}</span>
                {LOCALES[l].dir === 'rtl' && <span className="text-2xs text-ink-faint">RTL</span>}
              </MenuRadioItem>
            ))}
          </MenuRadioGroup>
          <MenuSeparator />
          <MenuLabel>{t('Theme')}</MenuLabel>
          <MenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
            <MenuRadioItem value="light">
              <Sun />
              {t('Light')}
            </MenuRadioItem>
            <MenuRadioItem value="dark">
              <Moon />
              {t('Dark')}
            </MenuRadioItem>
            <MenuRadioItem value="system">
              <Monitor />
              {t('System')}
            </MenuRadioItem>
          </MenuRadioGroup>
          <MenuSeparator />
          <MenuItem
            onSelect={() => {
              resetOnboarding()
              navigate('/welcome')
            }}
          >
            <LifeBuoy />
            {t('Replay onboarding')}
          </MenuItem>
          <MenuItem destructive onSelect={() => navigate('/welcome')}>
            <LogOut />
            {t('Sign out')}
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
}
