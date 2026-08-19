import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Banknote,
  Key,
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
  const [env, setEnv] = React.useState<'live' | 'test'>('live')

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* ── Create ─────────────────────────────────── */}
      <Menu>
        <MenuTrigger asChild>
          <button
            className="chrome inline-flex h-9 items-center gap-1.5 rounded-full pl-2.5 pr-3 text-sm font-medium text-ink transition-colors hover:bg-veil-strong"
            aria-label="Create"
          >
            <Plus className="size-4 text-brand" />
            <span className="hidden sm:inline">New</span>
          </button>
        </MenuTrigger>
        <MenuContent className="w-60">
          <MenuLabel>Create</MenuLabel>
          <MenuItem onSelect={() => navigate('/numbers/buy')} shortcut="B">
            <Phone />
            Phone number
          </MenuItem>
          <MenuItem onSelect={() => navigate('/sip?new=1')}>
            <Network />
            SIP connection
          </MenuItem>
          <MenuItem onSelect={() => navigate('/developers?new=1')}>
            <Key />
            API key
          </MenuItem>
          <MenuSeparator />
          <MenuItem onSelect={() => navigate('/billing?topup=1')}>
            <Banknote />
            Add funds to wallet
          </MenuItem>
        </MenuContent>
      </Menu>

      {/* ── Search ─────────────────────────────────── */}
      <Tooltip content="Search or jump to…">
        <button
          onClick={onOpenSearch}
          className="chrome inline-flex h-9 items-center gap-2 rounded-full px-3 text-ink-subtle transition-colors hover:bg-veil-strong hover:text-ink"
          aria-label="Search"
        >
          <Search className="size-4" />
          <Kbd className="hidden bg-transparent shadow-none lg:inline-flex">⌘K</Kbd>
        </button>
      </Tooltip>

      {stage !== 'approved' && (
        <Tooltip content="Verification unlocks every number range">
          <Link
            to="/verification"
            className={cn(
              'chrome hidden h-9 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors md:inline-flex',
              stage === 'rejected' ? 'text-danger-ink' : 'text-warning-ink',
            )}
          >
            <ShieldCheck className="size-3.5" />
            {stage === 'in_review' ? 'In review' : 'Verify account'}
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
              {e}
            </span>
          </button>
        ))}
      </div>

      <div className="chrome grid h-9 place-items-center rounded-full px-0.5">
        <NotificationBell />
      </div>

      {/* ── Account ────────────────────────────────── */}
      <Menu>
        <MenuTrigger asChild>
          <button
            className="chrome grid size-9 place-items-center rounded-full transition-opacity hover:opacity-85"
            aria-label="Account menu"
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
          <MenuLabel>Workspace</MenuLabel>
          <MenuItem onSelect={() => navigate('/settings')}>
            <span
              className="grid size-4 shrink-0 place-items-center rounded-[5px] text-[8px] font-semibold text-white"
              style={{ background: 'linear-gradient(150deg, hsl(174 62% 42%), hsl(196 72% 34%))' }}
            >
              {workspace.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 truncate">{workspace.name}</span>
            <span className="text-2xs text-ink-faint">
              {workspace.plan === 'payg' ? 'Pay as you go' : 'Volume'}
            </span>
          </MenuItem>
          <MenuSeparator />
          <MenuItem onSelect={() => navigate('/settings')}>
            <Settings />
            Account settings
          </MenuItem>
          <MenuItem onSelect={() => navigate('/verification')}>
            <ShieldCheck />
            Verification
          </MenuItem>
          <MenuSeparator />
          <MenuLabel>Appearance</MenuLabel>
          <MenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
            <MenuRadioItem value="light">
              <Sun />
              Light
            </MenuRadioItem>
            <MenuRadioItem value="dark">
              <Moon />
              Dark
            </MenuRadioItem>
            <MenuRadioItem value="system">
              <Monitor />
              System
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
            Replay onboarding
          </MenuItem>
          <MenuItem destructive onSelect={() => navigate('/welcome')}>
            <LogOut />
            Sign out
          </MenuItem>
        </MenuContent>
      </Menu>
    </div>
  )
}
