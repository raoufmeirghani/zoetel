import { Banknote, Blocks, Key, Network, Phone, ScanLine } from 'lucide-react'
import {
  Broadcast,
  ChartBar,
  GearSix,
  Key as KeyFill,
  Phone as PhoneFill,
  Pulse,
  Receipt,
  ShieldCheck,
  SquaresFour,
  TreeStructure,
  Users,
  Wallet,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

export interface NavItem {
  to: string
  label: string
  /**
   * Phosphor rather than lucide, because the rail renders these at `weight="fill"`
   * and lucide is a stroke-only set — filling its paths turns the line glyphs
   * (usage, webhooks, logs) into blobs. Icons elsewhere in the product stay
   * lucide; only navigation is filled.
   */
  icon: Icon
  end?: boolean
  badge?: 'numbers' | 'verification' | 'sip-alert'
  description?: string
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

/** Grouped for the expanded rail; the collapsed rail shows icons in this order. */
export const NAV: NavGroup[] = [
  {
    items: [
      {
        to: '/',
        label: 'Overview',
        icon: SquaresFour,
        end: true,
        description: 'Wallet, usage and next actions',
      },
      {
        to: '/numbers',
        label: 'Phone numbers',
        icon: PhoneFill,
        badge: 'numbers',
        description: 'Manage the numbers you own',
      },
      {
        to: '/sip',
        label: 'SIP connections',
        icon: TreeStructure,
        badge: 'sip-alert',
        description: 'Trunks, credentials and routing',
      },
      { to: '/analytics', label: 'Usage', icon: ChartBar, description: 'Minutes, spend and quality' },
    ],
  },
  {
    label: 'Billing',
    items: [
      {
        to: '/billing',
        label: 'Billing & wallet',
        icon: Wallet,
        description: 'Balance, invoices, payment methods',
      },
      { to: '/pricing', label: 'Pricing', icon: Receipt, description: 'Rates and volume discounts' },
    ],
  },
  {
    label: 'Developers',
    items: [
      {
        to: '/developers',
        label: 'API keys',
        icon: KeyFill,
        end: true,
        description: 'Create and rotate credentials',
      },
      {
        to: '/developers/webhooks',
        label: 'Webhooks',
        icon: Broadcast,
        description: 'Event delivery endpoints',
      },
      {
        to: '/developers/logs',
        label: 'Request logs',
        icon: Pulse,
        description: 'Every API call, searchable',
      },
    ],
  },
  {
    label: 'Account',
    items: [
      {
        to: '/verification',
        label: 'Verification',
        icon: ShieldCheck,
        badge: 'verification',
        description: 'Identity and business KYC',
      },
      { to: '/team', label: 'Team', icon: Users, description: 'Members, roles and audit log' },
      { to: '/settings', label: 'Settings', icon: GearSix, description: 'Workspace preferences' },
    ],
  },
]

export const QUICK_ACTIONS = [
  { label: 'Buy a phone number', to: '/numbers/buy', icon: Phone, hint: 'Search 40+ ranges in Egypt' },
  { label: 'Create SIP connection', to: '/sip?new=1', icon: Network, hint: 'Credential, IP or FQDN auth' },
  { label: 'Fund your wallet', to: '/billing?topup=1', icon: Banknote, hint: 'Card or bank transfer' },
  { label: 'Generate API key', to: '/developers?new=1', icon: Key, hint: 'Live and test environments' },
] as const

export const SETUP_TASKS = [
  { id: 'verify', label: 'Verify your business', to: '/verification', icon: ScanLine },
  { id: 'number', label: 'Buy your first number', to: '/numbers/buy', icon: Phone },
  { id: 'sip', label: 'Connect a SIP trunk', to: '/sip', icon: Network },
  { id: 'key', label: 'Generate an API key', to: '/developers', icon: Blocks },
] as const
