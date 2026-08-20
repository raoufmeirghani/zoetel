import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  ActivityItem,
  ApiKey,
  AuditEvent,
  CallRecord,
  Currency,
  DocKind,
  Invoice,
  Member,
  MessageRecord,
  NotificationItem,
  OwnedNumber,
  PaymentMethod,
  PhoneNumber,
  PlanKind,
  Profile,
  RequestLog,
  Role,
  SipConnection,
  Transaction,
  Verification,
  VerificationDoc,
  WebhookEndpoint,
  Workspace,
} from '@/lib/types'
import type { Locale } from '@/lib/i18n'
import {
  seedActivity,
  seedApiKeys,
  seedAudit,
  seedCalls,
  seedConnections,
  seedInvoices,
  seedMembers,
  seedMessages,
  seedNotifications,
  seedNumbers,
  seedPaymentMethods,
  seedRequestLogs,
  seedTransactions,
  seedWebhooks,
} from '@/lib/data/seed'
import { rid } from '@/lib/utils'

export type Theme = 'light' | 'dark' | 'system'

export interface OnboardingDraft {
  step: number
  accountType: 'individual' | 'business' | null
  name: string
  email: string
  password: string
  country: string
  workspaceName: string
  businessName: string
  timezone: string
  currency: Currency
  workspaceCountry: string
  useCase: string
  plan: PlanKind | null
  completed: boolean
}

const INDIVIDUAL_DOCS: DocKind[] = ['passport', 'national_id']
const BUSINESS_DOCS: DocKind[] = [
  'commercial_registration',
  'tax_certificate',
  'business_license',
  'representative_id',
  'proof_of_address',
]

export function docsFor(accountType: 'individual' | 'business'): VerificationDoc[] {
  return (accountType === 'business' ? BUSINESS_DOCS : INDIVIDUAL_DOCS).map((kind) => ({
    kind,
    status: 'missing' as const,
  }))
}

const freshOnboarding = (): OnboardingDraft => ({
  step: 0,
  accountType: null,
  name: '',
  email: '',
  password: '',
  country: 'EG',
  workspaceName: '',
  businessName: '',
  timezone: 'Africa/Cairo',
  currency: 'USD',
  workspaceCountry: 'EG',
  useCase: '',
  plan: null,
  completed: false,
})

interface AppState {
  hydratedAt: number
  theme: Theme
  /** False until the visitor has been through (or skipped) onboarding once. */
  hasOnboarded: boolean
  onboarding: OnboardingDraft
  profile: Profile
  workspace: Workspace
  balance: number
  /**
   * When we last handed this workspace over to Zoie. We can't see whether an
   * agent was actually built there, but we can stop re-asking someone who has
   * already crossed over.
   */
  zoieHandoffAt?: string
  /**
   * Whether the nav rail is pinned open. Lives in the store because the content
   * column has to yield room for it — a pinned rail that overlays the page hides
   * the first column of every table behind it.
   */
  navPinned: boolean
  /**
   * UI language. Drives both translation and writing direction — Arabic is
   * right-to-left, so this single value flips the whole layout.
   */
  locale: Locale
  autoRecharge: { enabled: boolean; threshold: number; amount: number }
  spendLimit: { enabled: boolean; monthly: number }
  numbers: OwnedNumber[]
  connections: SipConnection[]
  transactions: Transaction[]
  invoices: Invoice[]
  paymentMethods: PaymentMethod[]
  apiKeys: ApiKey[]
  webhooks: WebhookEndpoint[]
  requestLogs: RequestLog[]
  members: Member[]
  audit: AuditEvent[]
  calls: CallRecord[]
  messages: MessageRecord[]
  notifications: NotificationItem[]
  activity: ActivityItem[]
  verification: Verification
  favorites: string[]
  recentSearches: string[]
  cart: PhoneNumber[]
  demoMode: boolean

  setTheme: (t: Theme) => void
  markOnboarded: () => void
  patchOnboarding: (p: Partial<OnboardingDraft>) => void
  resetOnboarding: () => void
  completeOnboarding: () => void
  restartDemo: () => void
  setDemoMode: (on: boolean) => void

  addToCart: (n: PhoneNumber) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  toggleFavorite: (id: string) => void
  pushRecentSearch: (q: string) => void

  purchaseNumbers: (numbers: PhoneNumber[]) => OwnedNumber[]
  updateNumber: (id: string, patch: Partial<OwnedNumber>) => void
  releaseNumber: (id: string) => void

  createConnection: (c: Partial<SipConnection> & { name: string }) => SipConnection
  updateConnection: (id: string, patch: Partial<SipConnection>) => void
  deleteConnection: (id: string) => void

  topUp: (amount: number, method: string) => void
  setAutoRecharge: (p: Partial<AppState['autoRecharge']>) => void
  setNavPinned: (v: boolean) => void
  setLocale: (l: Locale) => void
  markZoieHandoff: () => void
  setSpendLimit: (p: Partial<AppState['spendLimit']>) => void
  addPaymentMethod: (pm: Omit<PaymentMethod, 'id'>) => void
  removePaymentMethod: (id: string) => void
  setDefaultPaymentMethod: (id: string) => void
  setPlan: (plan: PlanKind) => void

  createApiKey: (name: string, scope: ApiKey['scope'], environment: ApiKey['environment']) => ApiKey
  revokeApiKey: (id: string) => void
  createWebhook: (url: string, events: string[]) => WebhookEndpoint
  updateWebhook: (id: string, patch: Partial<WebhookEndpoint>) => void
  deleteWebhook: (id: string) => void

  inviteMember: (email: string, role: Role) => void
  updateMember: (id: string, patch: Partial<Member>) => void
  removeMember: (id: string) => void

  uploadDoc: (kind: DocKind, file: { name: string; size: number }) => void
  removeDoc: (kind: DocKind) => void
  submitVerification: () => void
  approveVerification: () => void
  rejectVerification: (reason: string) => void
  setAccountType: (t: 'individual' | 'business') => void

  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  pushNotification: (n: Omit<NotificationItem, 'id' | 'at' | 'read'>) => void
  pushActivity: (a: Omit<ActivityItem, 'id' | 'at'>) => void
  updateWorkspace: (p: Partial<Workspace>) => void
  updateProfile: (p: Partial<Profile>) => void
}

const nowIso = () => new Date().toISOString()

const seedVerification = (): Verification => ({
  accountType: 'business',
  stage: 'approved',
  submittedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
  reviewedAt: new Date(Date.now() - 26 * 3_600_000).toISOString(),
  estimatedHours: 24,
  docs: [
    {
      kind: 'commercial_registration',
      status: 'approved',
      fileName: 'acme-commercial-registration.pdf',
      sizeBytes: 1_284_119,
      uploadedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      ocr: [
        { field: 'Company name', value: 'Acme Retail LLC', confidence: 0.99 },
        { field: 'Registration no.', value: '118-4429-EG', confidence: 0.97 },
        { field: 'Issued', value: '14 Mar 2021', confidence: 0.94 },
      ],
    },
    {
      kind: 'tax_certificate',
      status: 'approved',
      fileName: 'tax-card-2026.pdf',
      sizeBytes: 642_881,
      uploadedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      ocr: [
        { field: 'Tax ID', value: '442-118-903', confidence: 0.98 },
        { field: 'Entity', value: 'Acme Retail LLC', confidence: 0.99 },
      ],
    },
    {
      kind: 'business_license',
      status: 'approved',
      fileName: 'trade-licence.pdf',
      sizeBytes: 918_220,
      uploadedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    },
    {
      kind: 'representative_id',
      status: 'approved',
      fileName: 'youssef-hegazy-id.jpg',
      sizeBytes: 2_104_882,
      uploadedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      ocr: [
        { field: 'Full name', value: 'Youssef Hegazy', confidence: 0.99 },
        { field: 'National ID', value: '2880********', confidence: 0.91 },
      ],
    },
    {
      kind: 'proof_of_address',
      status: 'approved',
      fileName: 'utility-bill-july.pdf',
      sizeBytes: 388_442,
      uploadedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    },
  ],
  timeline: [
    {
      at: new Date(Date.now() - 3 * 86_400_000).toISOString(),
      label: 'Documents submitted',
      detail: '5 files · Acme Retail LLC',
      state: 'done',
    },
    {
      at: new Date(Date.now() - 2.4 * 86_400_000).toISOString(),
      label: 'Automated checks passed',
      detail: 'OCR match, sanctions screening',
      state: 'done',
    },
    {
      at: new Date(Date.now() - 30 * 3_600_000).toISOString(),
      label: 'Compliance review',
      detail: 'Reviewed by Zoetel compliance',
      state: 'done',
    },
    {
      at: new Date(Date.now() - 26 * 3_600_000).toISOString(),
      label: 'Approved',
      detail: 'National & toll-free ranges unlocked',
      state: 'done',
    },
  ],
})

const baseState = () => ({
  hydratedAt: Date.now(),
  theme: 'light' as Theme,
  hasOnboarded: false,
  onboarding: freshOnboarding(),
  profile: {
    name: 'Youssef Hegazy',
    email: 'youssef@acmeretail.eg',
    country: 'EG',
    accountType: 'business' as const,
    avatarHue: 249,
  },
  workspace: {
    id: 'ws_acme_retail',
    name: 'Acme Retail',
    businessName: 'Acme Retail LLC',
    country: 'EG',
    timezone: 'Africa/Cairo',
    currency: 'USD' as Currency,
    plan: 'payg' as PlanKind,
    createdAt: new Date(Date.now() - 120 * 86_400_000).toISOString(),
    useCase: 'ai-voice',
  },
  balance: 1284.6,
  autoRecharge: { enabled: true, threshold: 250, amount: 500 },
  navPinned: false,
  locale: 'en' as Locale,
  spendLimit: { enabled: false, monthly: 5000 },
  numbers: seedNumbers(),
  connections: seedConnections(),
  transactions: seedTransactions(),
  invoices: seedInvoices(),
  paymentMethods: seedPaymentMethods(),
  apiKeys: seedApiKeys(),
  webhooks: seedWebhooks(),
  requestLogs: seedRequestLogs(),
  members: seedMembers(),
  audit: seedAudit(),
  calls: seedCalls(),
  messages: seedMessages(),
  notifications: seedNotifications(),
  activity: seedActivity(),
  verification: seedVerification(),
  favorites: [] as string[],
  recentSearches: [] as string[],
  cart: [] as PhoneNumber[],
  demoMode: true,
})

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      ...baseState(),

      setTheme: (theme) => set({ theme }),
      markOnboarded: () => set({ hasOnboarded: true }),

      patchOnboarding: (p) => set((s) => ({ onboarding: { ...s.onboarding, ...p } })),
      resetOnboarding: () => set({ onboarding: freshOnboarding() }),
      completeOnboarding: () =>
        set((s) => {
          const o = s.onboarding
          return {
            hasOnboarded: true,
            onboarding: { ...o, completed: true },
            profile: {
              ...s.profile,
              name: o.name || s.profile.name,
              email: o.email || s.profile.email,
              country: o.country,
              accountType: o.accountType ?? 'business',
            },
            workspace: {
              ...s.workspace,
              name: o.workspaceName || s.workspace.name,
              businessName: o.businessName || s.workspace.businessName,
              country: o.workspaceCountry,
              timezone: o.timezone,
              currency: o.currency,
              plan: o.plan ?? 'payg',
              useCase: o.useCase || s.workspace.useCase,
            },
          }
        }),
      restartDemo: () =>
        set({ ...baseState(), theme: get().theme, hasOnboarded: true, onboarding: freshOnboarding() }),
      setDemoMode: (demoMode) => set({ demoMode }),

      addToCart: (n) => set((s) => (s.cart.some((c) => c.id === n.id) ? s : { cart: [...s.cart, n] })),
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((c) => c.id !== id) })),
      clearCart: () => set({ cart: [] }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
        })),
      pushRecentSearch: (q) =>
        set((s) => ({ recentSearches: [q, ...s.recentSearches.filter((r) => r !== q)].slice(0, 6) })),

      purchaseNumbers: (numbers) => {
        const owned: OwnedNumber[] = numbers.map((n) => ({
          ...n,
          status:
            n.requiresRegulatoryDocs && get().verification.stage !== 'approved'
              ? 'pending_verification'
              : 'active',
          purchasedAt: nowIso(),
          compliance: n.requiresRegulatoryDocs
            ? get().verification.stage === 'approved'
              ? 'approved'
              : 'required'
            : 'not_required',
          smsEnabled: n.capabilities.includes('sms'),
          recordingEnabled: false,
          cnamEnabled: false,
          tags: [],
          usage: { minutes: 0, calls: 0, messages: 0, spend: 0 },
        }))
        const total = numbers.reduce((sum, n) => sum + n.monthly + n.setup, 0)
        set((s) => ({
          numbers: [...owned, ...s.numbers],
          balance: Math.round((s.balance - total) * 100) / 100,
          cart: [],
          transactions: [
            {
              id: rid('tx'),
              kind: 'number' as const,
              description:
                numbers.length === 1
                  ? `Number ${numbers[0].e164} — setup & first month`
                  : `${numbers.length} numbers — setup & first month`,
              amount: -total,
              status: 'succeeded' as const,
              createdAt: nowIso(),
            },
            ...s.transactions,
          ],
          activity: [
            {
              id: rid('ac'),
              actor: s.profile.name,
              action:
                numbers.length === 1 ? `purchased ${numbers[0].e164}` : `purchased ${numbers.length} numbers`,
              detail: `${numbers[0].country} · ${numbers[0].type}`,
              at: nowIso(),
              kind: 'number' as const,
            },
            ...s.activity,
          ],
          notifications: [
            {
              id: rid('nt'),
              title: numbers.length === 1 ? 'Number purchased' : 'Numbers purchased',
              body:
                numbers.length === 1
                  ? `${numbers[0].e164} is ready to configure.`
                  : `${numbers.length} numbers were added to your workspace.`,
              at: nowIso(),
              read: false,
              kind: 'number' as const,
              severity: 'success' as const,
              href: '/numbers',
            },
            ...s.notifications,
          ],
        }))
        return owned
      },
      updateNumber: (id, patch) =>
        set((s) => ({ numbers: s.numbers.map((n) => (n.id === id ? { ...n, ...patch } : n)) })),
      releaseNumber: (id) =>
        set((s) => ({
          numbers: s.numbers.filter((n) => n.id !== id),
          activity: [
            {
              id: rid('ac'),
              actor: s.profile.name,
              action: 'released a number',
              at: nowIso(),
              kind: 'number' as const,
            },
            ...s.activity,
          ],
        })),

      createConnection: (c) => {
        const conn: SipConnection = {
          id: rid('sip', 10),
          name: c.name,
          authMode: c.authMode ?? 'credential',
          status: 'provisioning',
          transport: c.transport ?? 'tls',
          srtp: c.srtp ?? true,
          region: c.region ?? 'Cairo (eg-cai-1)',
          createdAt: nowIso(),
          channelLimit: c.channelLimit ?? 50,
          concurrentCalls: 0,
          username: c.username ?? `zt_${Math.random().toString(36).slice(2, 10)}`,
          password: c.password ?? Math.random().toString(36).slice(2, 12) + 'Aq7$',
          fqdn: c.fqdn,
          allowedIps: c.allowedIps ?? [],
          inbound: c.inbound ?? {
            codecs: ['OPUS', 'PCMA', 'PCMU'],
            dtmfType: 'RFC 2833',
            encryptedMedia: c.srtp ?? true,
            ani: 'e164',
          },
          outbound: c.outbound ?? { localization: 'EG', channelLimit: c.channelLimit ?? 50, t38: false },
          health: { latencyMs: 0, asr: 0, mos: 0, packetLoss: 0, jitterMs: 0 },
          numbersAssigned: 0,
          stats: { minutes: 0, calls: 0, spend: 0 },
        }
        set((s) => ({
          connections: [conn, ...s.connections],
          activity: [
            {
              id: rid('ac'),
              actor: s.profile.name,
              action: `created SIP connection ${conn.name}`,
              at: nowIso(),
              kind: 'sip' as const,
            },
            ...s.activity,
          ],
        }))
        // Simulate provisioning completing
        setTimeout(() => {
          set((s) => ({
            connections: s.connections.map((x) =>
              x.id === conn.id
                ? {
                    ...x,
                    status: 'active' as const,
                    health: { latencyMs: 16, asr: 0, mos: 0, packetLoss: 0, jitterMs: 3 },
                  }
                : x,
            ),
          }))
        }, 2600)
        return conn
      },
      updateConnection: (id, patch) =>
        set((s) => ({ connections: s.connections.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteConnection: (id) => set((s) => ({ connections: s.connections.filter((c) => c.id !== id) })),

      topUp: (amount, method) =>
        set((s) => ({
          balance: Math.round((s.balance + amount) * 100) / 100,
          transactions: [
            {
              id: rid('tx'),
              kind: 'topup' as const,
              description: 'Wallet top-up',
              amount,
              status: 'succeeded' as const,
              createdAt: nowIso(),
              method,
              reference: rid('ch', 8),
            },
            ...s.transactions,
          ],
          notifications: [
            {
              id: rid('nt'),
              title: 'Wallet funded',
              body: `$${amount.toFixed(2)} was added to your wallet.`,
              at: nowIso(),
              read: false,
              kind: 'billing' as const,
              severity: 'success' as const,
              href: '/billing',
            },
            ...s.notifications,
          ],
        })),
      setAutoRecharge: (p) => set((s) => ({ autoRecharge: { ...s.autoRecharge, ...p } })),

      markZoieHandoff: () => set({ zoieHandoffAt: new Date().toISOString() }),

      setNavPinned: (v) => set({ navPinned: v }),

      setLocale: (l) => set({ locale: l }),
      setSpendLimit: (p) => set((s) => ({ spendLimit: { ...s.spendLimit, ...p } })),
      addPaymentMethod: (pm) =>
        set((s) => ({
          paymentMethods: [
            ...s.paymentMethods.map((m) => ({ ...m, isDefault: pm.isDefault ? false : m.isDefault })),
            { ...pm, id: rid('pm', 8) },
          ],
        })),
      removePaymentMethod: (id) =>
        set((s) => ({ paymentMethods: s.paymentMethods.filter((p) => p.id !== id) })),
      setDefaultPaymentMethod: (id) =>
        set((s) => ({ paymentMethods: s.paymentMethods.map((p) => ({ ...p, isDefault: p.id === id })) })),
      setPlan: (plan) => set((s) => ({ workspace: { ...s.workspace, plan } })),

      createApiKey: (name, scope, environment) => {
        const key: ApiKey = {
          id: rid('key', 8),
          name,
          token: `ztl_${environment}_${Math.random().toString(36).slice(2, 14)}${Math.random()
            .toString(36)
            .slice(2, 14)}`,
          createdAt: nowIso(),
          scope,
          environment,
          status: 'active',
          requests7d: 0,
        }
        set((s) => ({
          apiKeys: [key, ...s.apiKeys],
          audit: [
            {
              id: rid('ae'),
              actor: s.profile.name,
              action: 'Created API key',
              target: name,
              at: nowIso(),
              ip: '41.33.87.12',
              category: 'api' as const,
            },
            ...s.audit,
          ],
        }))
        return key
      },
      revokeApiKey: (id) =>
        set((s) => ({
          apiKeys: s.apiKeys.map((k) => (k.id === id ? { ...k, status: 'revoked' as const } : k)),
        })),
      createWebhook: (url, events) => {
        const wh: WebhookEndpoint = {
          id: rid('wh', 8),
          url,
          events,
          status: 'healthy',
          secret: `whsec_${Math.random().toString(36).slice(2, 12)}`,
          successRate: 100,
          deliveries24h: 0,
        }
        set((s) => ({ webhooks: [wh, ...s.webhooks] }))
        return wh
      },
      updateWebhook: (id, patch) =>
        set((s) => ({ webhooks: s.webhooks.map((w) => (w.id === id ? { ...w, ...patch } : w)) })),
      deleteWebhook: (id) => set((s) => ({ webhooks: s.webhooks.filter((w) => w.id !== id) })),

      inviteMember: (email, role) =>
        set((s) => ({
          members: [
            ...s.members,
            {
              id: rid('mem', 6),
              name: email
                .split('@')[0]
                .replace(/[._]/g, ' ')
                .replace(/\b\w/g, (m) => m.toUpperCase()),
              email,
              role,
              status: 'invited' as const,
              twoFactor: false,
              hue: Math.floor(Math.random() * 360),
            },
          ],
          audit: [
            {
              id: rid('ae'),
              actor: s.profile.name,
              action: 'Invited member',
              target: email,
              at: nowIso(),
              ip: '41.33.87.12',
              category: 'team' as const,
            },
            ...s.audit,
          ],
        })),
      updateMember: (id, patch) =>
        set((s) => ({ members: s.members.map((m) => (m.id === id ? { ...m, ...patch } : m)) })),
      removeMember: (id) => set((s) => ({ members: s.members.filter((m) => m.id !== id) })),

      uploadDoc: (kind, file) =>
        set((s) => ({
          verification: {
            ...s.verification,
            stage: s.verification.stage === 'not_started' ? 'in_progress' : s.verification.stage,
            docs: s.verification.docs.map((d) =>
              d.kind === kind
                ? {
                    ...d,
                    status: 'submitted' as const,
                    fileName: file.name,
                    sizeBytes: file.size,
                    uploadedAt: nowIso(),
                    rejectionReason: undefined,
                    ocr: ocrFor(kind),
                  }
                : d,
            ),
          },
        })),
      removeDoc: (kind) =>
        set((s) => ({
          verification: {
            ...s.verification,
            docs: s.verification.docs.map((d) => (d.kind === kind ? { kind, status: 'missing' as const } : d)),
          },
        })),
      submitVerification: () =>
        set((s) => ({
          verification: {
            ...s.verification,
            stage: 'in_review',
            submittedAt: nowIso(),
            timeline: [
              ...s.verification.timeline.filter((t) => t.state === 'done'),
              {
                at: nowIso(),
                label: 'Documents submitted',
                detail: `${s.verification.docs.filter((d) => d.status !== 'missing').length} files`,
                state: 'done' as const,
              },
              {
                at: nowIso(),
                label: 'Automated checks',
                detail: 'OCR & sanctions screening',
                state: 'active' as const,
              },
              {
                at: nowIso(),
                label: 'Compliance review',
                detail: 'Typically within 24 hours',
                state: 'pending' as const,
              },
              { at: nowIso(), label: 'Approved', state: 'pending' as const },
            ],
          },
          notifications: [
            {
              id: rid('nt'),
              title: 'Verification submitted',
              body: 'We are reviewing your documents. Most reviews finish within 24 hours.',
              at: nowIso(),
              read: false,
              kind: 'verification' as const,
              severity: 'info' as const,
              href: '/verification',
            },
            ...s.notifications,
          ],
        })),
      approveVerification: () =>
        set((s) => ({
          verification: {
            ...s.verification,
            stage: 'approved',
            reviewedAt: nowIso(),
            docs: s.verification.docs.map((d) =>
              d.status === 'submitted' ? { ...d, status: 'approved' as const } : d,
            ),
            timeline: [
              ...s.verification.timeline.map((t) =>
                t.state === 'active' ? { ...t, state: 'done' as const } : t,
              ),
              { at: nowIso(), label: 'Approved', detail: 'All ranges unlocked', state: 'done' as const },
            ].filter((t, i, arr) => !(t.label === 'Approved' && t.state === 'pending' && arr.length > i)),
          },
          numbers: s.numbers.map((n) =>
            n.status === 'pending_verification'
              ? { ...n, status: 'active' as const, compliance: 'approved' as const }
              : n,
          ),
          notifications: [
            {
              id: rid('nt'),
              title: 'Verification approved',
              body: 'Your account is verified. All number ranges are now available.',
              at: nowIso(),
              read: false,
              kind: 'verification' as const,
              severity: 'success' as const,
              href: '/verification',
            },
            ...s.notifications,
          ],
        })),
      rejectVerification: (reason) =>
        set((s) => ({
          verification: {
            ...s.verification,
            stage: 'rejected',
            reviewedAt: nowIso(),
            docs: s.verification.docs.map((d, i) =>
              i === 0 && d.status !== 'missing'
                ? { ...d, status: 'rejected' as const, rejectionReason: reason }
                : d,
            ),
            timeline: [
              ...s.verification.timeline.map((t) =>
                t.state === 'active' ? { ...t, state: 'done' as const } : t,
              ),
              { at: nowIso(), label: 'Needs attention', detail: reason, state: 'failed' as const },
            ],
          },
        })),
      setAccountType: (t) =>
        set((s) => ({
          profile: { ...s.profile, accountType: t },
          verification: {
            ...s.verification,
            accountType: t,
            docs: docsFor(t),
            stage: 'not_started',
            timeline: [],
          },
        })),

      markNotificationRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
      markAllNotificationsRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      clearNotifications: () => set({ notifications: [] }),
      pushNotification: (n) =>
        set((s) => ({
          notifications: [{ ...n, id: rid('nt'), at: nowIso(), read: false }, ...s.notifications],
        })),
      pushActivity: (a) => set((s) => ({ activity: [{ ...a, id: rid('ac'), at: nowIso() }, ...s.activity] })),
      updateWorkspace: (p) => set((s) => ({ workspace: { ...s.workspace, ...p } })),
      updateProfile: (p) => set((s) => ({ profile: { ...s.profile, ...p } })),
    }),
    {
      name: 'zoetel.v1',
      version: 4,
      partialize: (s) => {
        const { ...rest } = s
        return rest
      },
      migrate: () => ({ ...baseState() }) as never,
      onRehydrateStorage: () => (state) => {
        // Re-seed time-sensitive fixtures if the snapshot is stale, so
        // relative timestamps ("4 min ago") always read as live.
        if (!state) return
        if (Date.now() - (state.hydratedAt ?? 0) > 6 * 3_600_000) {
          useApp.setState({
            hydratedAt: Date.now(),
            requestLogs: seedRequestLogs(),
            calls: seedCalls(),
            messages: seedMessages(),
          })
        }
      },
    },
  ),
)

function ocrFor(kind: DocKind) {
  switch (kind) {
    case 'passport':
      return [
        { field: 'Surname', value: 'HEGAZY', confidence: 0.99 },
        { field: 'Given names', value: 'YOUSSEF AHMED', confidence: 0.98 },
        { field: 'Passport no.', value: 'A214****', confidence: 0.96 },
        { field: 'Expiry', value: '11 Jun 2031', confidence: 0.95 },
      ]
    case 'national_id':
      return [
        { field: 'Full name', value: 'Youssef Ahmed Hegazy', confidence: 0.98 },
        { field: 'National ID', value: '2880********', confidence: 0.93 },
      ]
    case 'commercial_registration':
      return [
        { field: 'Company name', value: 'Acme Retail LLC', confidence: 0.99 },
        { field: 'Registration no.', value: '118-4429-EG', confidence: 0.96 },
      ]
    case 'tax_certificate':
      return [{ field: 'Tax ID', value: '442-118-903', confidence: 0.97 }]
    case 'representative_id':
      return [{ field: 'Full name', value: 'Youssef Hegazy', confidence: 0.98 }]
    default:
      return [{ field: 'Document', value: 'Readable', confidence: 0.94 }]
  }
}

/* ── Selectors ───────────────────────────────────────────── */
export const selCurrency = (s: AppState) => s.workspace.currency
export const selUnreadCount = (s: AppState) => s.notifications.filter((n) => !n.read).length
export const selActiveCount = (s: AppState) =>
  s.numbers.reduce((n, x) => n + (x.status === 'active' ? 1 : 0), 0)
export const selMonthlyRecurring = (s: AppState) => s.numbers.reduce((sum, n) => sum + n.monthly, 0)
export const selMonthSpend = (s: AppState) =>
  s.transactions
    .filter((t) => t.amount < 0 && new Date(t.createdAt).getMonth() === new Date().getMonth())
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
export const selConcurrentCalls = (s: AppState) =>
  s.connections.reduce(
    (sum, c) => sum + (c.status === 'active' || c.status === 'degraded' ? c.concurrentCalls : 0),
    0,
  )
export const selMinutesUsed = (s: AppState) => s.numbers.reduce((sum, n) => sum + n.usage.minutes, 0)
