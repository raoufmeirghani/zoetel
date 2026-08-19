import type { LucideIcon } from 'lucide-react'
import {
  Banknote,
  ChartLine,
  Cpu,
  Network,
  Phone,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react'
import { useApp } from '@/store/app'
import type { ZoieTarget } from './zoie'
import { isRouted } from './types'
import { monthToDate } from './data/seed'

export type StageId =
  'account' | 'verify' | 'fund' | 'number' | 'routing' | 'live' | 'agent' | 'monitor' | 'optimize'

export interface Stage {
  id: StageId
  label: string
  /** Second person, present tense — this is what the customer is being asked to do. */
  action: string
  /** Why it matters, in one sentence. */
  why: string
  icon: LucideIcon
  to: string
  cta: string
  done: boolean
  /**
   * Set when the stage continues in Zoie rather than here. The consumer opens it
   * in a new tab — the customer is stepping sideways in the same job, not away.
   */
  zoie?: ZoieTarget
  /** True while this is the stage the customer is standing on. */
  current: boolean
  /** Waiting on us, not on them. */
  waiting?: boolean
}

export type AttentionSeverity = 'critical' | 'warning' | 'info'

export interface AttentionItem {
  id: string
  severity: AttentionSeverity
  title: string
  detail: string
  to: string
  cta: string
  icon: LucideIcon
}

/**
 * Whatever deserves the top of the page right now — a blocking problem always
 * outranks the next setup step, which outranks an optimisation nudge.
 */
export interface Spotlight {
  kind: 'stage' | 'attention'
  eyebrow: string
  title: string
  why: string
  cta: string
  to: string
  icon: LucideIcon
  tone: 'brand' | 'danger' | 'warning' | 'success'
  waiting?: boolean
  /** Set when the CTA continues in Zoie, in a new tab. */
  zoie?: ZoieTarget
}

export interface Journey {
  stages: Stage[]
  spotlight: Spotlight | null
  /** The stage the customer is on, or null once everything is done. */
  currentStage: Stage | null
  /** Prioritised list of things that need a human decision. */
  attention: AttentionItem[]
  /** 0–100 across the setup half of the journey. */
  progress: number
  setupComplete: boolean
  /** True when nothing needs attention and setup is done. */
  allClear: boolean
}

const SEVERITY_RANK: Record<AttentionSeverity, number> = { critical: 0, warning: 1, info: 2 }

/**
 * Derives where the customer stands from the state we already hold, so every
 * surface can ask the same question: what should this person do next?
 */
export function useJourney(): Journey {
  const verification = useApp((s) => s.verification)
  const balance = useApp((s) => s.balance)
  const threshold = useApp((s) => s.autoRecharge.threshold)
  const numbers = useApp((s) => s.numbers)
  const connections = useApp((s) => s.connections)
  const webhooks = useApp((s) => s.webhooks)
  const members = useApp((s) => s.members)
  const transactions = useApp((s) => s.transactions)
  const plan = useApp((s) => s.workspace.plan)
  const zoieHandoffAt = useApp((s) => s.zoieHandoffAt)

  const verified = verification.stage === 'approved'
  const inReview = verification.stage === 'in_review'
  const funded = balance > 0 || transactions.some((t) => t.kind === 'topup' && t.status === 'succeeded')
  const hasNumber = numbers.length > 0
  const routed = numbers.some(isRouted)
  const activeNumber = numbers.some((n) => n.status === 'active' && isRouted(n))
  const minutes = numbers.reduce((sum, n) => sum + n.usage.minutes, 0)
  const hasTraffic = minutes > 0
  const mtd = monthToDate()

  const raw: Omit<Stage, 'current'>[] = [
    {
      id: 'account',
      label: 'Account',
      action: 'Create your workspace',
      why: 'A workspace holds your numbers, wallet and team.',
      icon: Rocket,
      to: '/settings',
      cta: 'Open settings',
      done: true,
    },
    {
      id: 'verify',
      label: 'Identity',
      action: verified ? 'Identity verified' : inReview ? 'Verification in review' : 'Verify who you are',
      why: 'Egyptian regulation requires a verified entity before regulated ranges can be provisioned.',
      icon: verified ? UserRoundCheck : ShieldCheck,
      to: '/verification',
      cta:
        verification.stage === 'rejected' ? 'Fix documents' : inReview ? 'View status' : 'Start verification',
      done: verified,
      waiting: inReview,
    },
    {
      id: 'fund',
      label: 'Wallet',
      action: 'Put credit in your wallet',
      why: 'Usage is drawn from a prepaid balance, so nothing can run away from you.',
      icon: Banknote,
      to: '/billing?topup=1',
      cta: 'Add funds',
      done: funded,
    },
    {
      id: 'number',
      label: 'Number',
      action: 'Get your first phone number',
      why: 'A number is how the world reaches you. Local Cairo lines activate instantly.',
      icon: Phone,
      to: '/numbers/buy',
      cta: 'Browse numbers',
      done: hasNumber,
    },
    {
      id: 'routing',
      label: 'Routing',
      action: 'Point a number at your stack',
      why: 'Routing decides where an inbound call is delivered — a SIP trunk or a webhook.',
      icon: Network,
      to: hasNumber ? `/numbers/${numbers[0]?.id ?? ''}` : '/sip',
      cta: 'Set up routing',
      done: routed,
    },
    {
      id: 'live',
      label: 'Go live',
      action: 'Take your first call',
      why: 'Place a test call to confirm audio, then switch your traffic over.',
      icon: Sparkles,
      to: '/sip',
      cta: 'Run a test call',
      done: activeNumber && hasTraffic,
    },
    {
      // Infrastructure ends here and intelligence begins. It reads as the next
      // step in the same journey because that is what it is.
      id: 'agent',
      label: 'Add intelligence',
      action: 'Let an AI agent answer',
      why: 'Zoie answers, qualifies and books on the numbers you just set up.',
      icon: Cpu,
      to: '/numbers',
      cta: 'Open Zoie',
      zoie: 'voice-agent' as const,
      done: !!zoieHandoffAt,
    },
    {
      id: 'monitor',
      label: 'Monitor',
      action: 'Watch quality and spend',
      why: 'Answer rates and MOS tell you whether your callers are having a good time.',
      icon: ChartLine,
      to: '/analytics',
      cta: 'Open usage',
      done: hasTraffic && mtd.spend > 0,
    },
    {
      id: 'optimize',
      label: 'Optimise',
      action: 'Bring your rate down',
      why: 'At your volume a committed plan cuts the per-minute rate materially.',
      icon: ChartLine,
      to: '/pricing',
      cta: 'Compare plans',
      done: plan === 'volume' || mtd.spend < 250,
    },
  ]

  const firstOpen = raw.findIndex((s) => !s.done)
  const stages: Stage[] = raw.map((s, i) => ({ ...s, current: i === firstOpen }))
  const currentStage = firstOpen === -1 ? null : stages[firstOpen]

  const setupIds: StageId[] = ['verify', 'fund', 'number', 'routing', 'live']
  const setupStages = stages.filter((s) => setupIds.includes(s.id))
  const setupDone = setupStages.filter((s) => s.done).length
  const progress = Math.round((setupDone / setupStages.length) * 100)

  const attention: AttentionItem[] = []

  if (verification.stage === 'rejected') {
    attention.push({
      id: 'kyc-rejected',
      severity: 'critical',
      title: 'A verification document was rejected',
      detail: 'Everything else passed. Replace the flagged file and we re-review within 24 hours.',
      to: '/verification',
      cta: 'Fix it',
      icon: ShieldCheck,
    })
  }

  if (balance < threshold) {
    attention.push({
      id: 'low-balance',
      severity: balance <= 0 ? 'critical' : 'warning',
      title: balance <= 0 ? 'Your wallet is empty' : 'Wallet balance is low',
      detail:
        balance <= 0
          ? 'Outbound calls and new purchases are being rejected until you top up.'
          : `Below your ${threshold} threshold. Calls stop when it reaches zero.`,
      to: '/billing?topup=1',
      cta: 'Add funds',
      icon: Banknote,
    })
  }

  const unhealthy = connections.filter((c) => c.status === 'degraded' || c.status === 'offline')
  if (unhealthy.length) {
    const worst = unhealthy.find((c) => c.status === 'offline') ?? unhealthy[0]
    attention.push({
      id: 'sip-health',
      severity: worst.status === 'offline' ? 'critical' : 'warning',
      title: `${worst.name} is ${worst.status}`,
      detail:
        worst.status === 'offline'
          ? 'No SIP registration received recently, so calls to it are failing.'
          : `${worst.health.packetLoss}% packet loss and ${worst.health.jitterMs} ms jitter on your side of the trunk.`,
      to: `/sip/${worst.id}`,
      cta: 'Diagnose',
      icon: Network,
    })
  }

  const held = numbers.filter((n) => n.status === 'pending_verification')
  if (held.length) {
    attention.push({
      id: 'held-numbers',
      severity: 'warning',
      title: `${held.length} number${held.length === 1 ? '' : 's'} held for compliance`,
      detail: `${held.map((n) => n.e164).join(', ')} ${held.length === 1 ? 'is' : 'are'} reserved but can't route calls yet. You aren't billed while held.`,
      to: '/verification',
      cta: 'Complete verification',
      icon: ShieldCheck,
    })
  }

  const failingHook = webhooks.find((w) => w.status === 'failing')
  if (failingHook) {
    attention.push({
      id: 'webhook',
      severity: 'warning',
      title: 'A webhook endpoint is failing',
      detail: `${failingHook.url} is returning errors for ${(100 - failingHook.successRate).toFixed(1)}% of deliveries.`,
      to: '/developers/webhooks',
      cta: 'Inspect',
      icon: Network,
    })
  }

  const unrouted = numbers.filter((n) => n.status === 'active' && !isRouted(n))
  if (unrouted.length && routed) {
    attention.push({
      id: 'unrouted',
      severity: 'info',
      title: `${unrouted.length} number${unrouted.length === 1 ? '' : 's'} not routed`,
      detail: 'Inbound calls to these numbers are rejected because nothing is listening.',
      to: '/numbers',
      cta: 'Assign routing',
      icon: Phone,
    })
  }

  const no2fa = members.filter((m) => m.status === 'active' && !m.twoFactor)
  if (no2fa.length) {
    attention.push({
      id: '2fa',
      severity: 'info',
      title: `${no2fa.length} teammate${no2fa.length === 1 ? '' : 's'} without two-factor auth`,
      detail: 'A single leaked password is enough to place calls on your wallet.',
      to: '/team',
      cta: 'Require 2FA',
      icon: ShieldCheck,
    })
  }

  attention.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity])

  const setupComplete = setupStages.every((s) => s.done)

  const blocking = attention.find((a) => a.severity === 'critical')
  const nagging = attention.find((a) => a.severity === 'warning')

  const stageSpotlight = (stage: Stage): Spotlight => ({
    kind: 'stage',
    eyebrow: stage.waiting ? 'With us right now' : 'Your next step',
    title: stage.action,
    why: stage.why,
    cta: stage.cta,
    to: stage.to,
    icon: stage.icon,
    tone: 'brand',
    waiting: stage.waiting,
    zoie: stage.zoie,
  })

  const attentionSpotlight = (item: AttentionItem): Spotlight => ({
    kind: 'attention',
    eyebrow: item.severity === 'critical' ? 'Needs fixing first' : 'Worth doing now',
    title: item.title,
    why: item.detail,
    cta: item.cta,
    to: item.to,
    icon: item.icon,
    tone: item.severity === 'critical' ? 'danger' : 'warning',
  })

  let spotlight: Spotlight | null = null
  if (blocking) spotlight = attentionSpotlight(blocking)
  else if (currentStage && !setupComplete) spotlight = stageSpotlight(currentStage)
  else if (nagging) spotlight = attentionSpotlight(nagging)
  else if (currentStage) spotlight = stageSpotlight(currentStage)

  return {
    stages,
    spotlight,
    currentStage,
    attention,
    progress,
    setupComplete,
    allClear: setupComplete && attention.length === 0,
  }
}
