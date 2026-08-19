import * as React from 'react'
import { useApp } from '@/store/app'

/**
 * Zoie is a separate product on a separate domain — Zoetel is the
 * infrastructure, Zoie is the intelligence layer on top of it. It is never an
 * advert or an upsell here: it appears as one of the destinations a channel can
 * point at, alongside SIP, forwarding and webhooks.
 *
 * Everything in this module exists to make crossing over feel like opening
 * another window of the same application: a deep link straight to the thing the
 * customer was already trying to do, with everything we already know about them
 * carried along so they never type it twice.
 */
export const ZOIE_URL = import.meta.env.VITE_ZOIE_URL ?? 'https://us.zoie.ai'

/**
 * What the customer is trying to build. Each maps to a specific screen in Zoie,
 * so nobody who arrives with a known intent ever lands on Zoie's homepage.
 */
export type ZoieTarget =
  'voice-agent' | 'sms-agent' | 'whatsapp-agent' | 'email-agent' | 'chat-widget' | 'workflow' | 'overview'

const PATHS: Record<ZoieTarget, string> = {
  'voice-agent': '/agents/voice/new',
  'sms-agent': '/agents/sms/new',
  'whatsapp-agent': '/agents/whatsapp/new',
  'email-agent': '/agents/email/new',
  'chat-widget': '/agents/chat/new',
  workflow: '/workflows/new',
  overview: '/',
}

/**
 * The account facts that are safe to hand over, so Zoie can skip its own
 * onboarding. Deliberately no credentials, no wallet balance, no documents —
 * only what Zoie needs to pre-fill a workspace and pre-select a channel.
 */
export interface ZoieContext {
  workspace: string
  business: string
  country: string
  timezone: string
  currency: string
  plan: string
  language: string
  customer: string
  accountType: 'individual' | 'business'
  verified: boolean
  /** E.164 numbers already owned, so the agent's channel is pre-selected. */
  numbers: string[]
  channels: string[]
}

/** Reads the handover context out of the workspace we already have. */
export function useZoieContext(): ZoieContext {
  const workspace = useApp((s) => s.workspace)
  const profile = useApp((s) => s.profile)
  const verification = useApp((s) => s.verification)
  const numbers = useApp((s) => s.numbers)

  return React.useMemo(() => {
    const channels = new Set<string>()
    numbers.forEach((n) => n.capabilities.forEach((c) => channels.add(c)))

    return {
      workspace: workspace.name,
      business: workspace.businessName,
      country: workspace.country,
      timezone: workspace.timezone,
      currency: workspace.currency,
      plan: workspace.plan,
      language: 'en',
      customer: profile.name,
      accountType: verification.accountType,
      verified: verification.stage === 'approved',
      numbers: numbers.filter((n) => n.status === 'active').map((n) => n.e164),
      channels: [...channels],
    }
  }, [workspace, profile, verification, numbers])
}

/**
 * Builds the deep link. `focus` is the specific resource the customer was
 * looking at — usually the number they just bought — so Zoie can pre-select it
 * rather than asking which channel the agent should answer on.
 *
 * In production this would be a signed, single-use handover token rather than
 * query parameters; the shape of what crosses over is the same either way.
 */
export function zoieUrl(target: ZoieTarget, ctx: ZoieContext, focus?: { number?: string }): string {
  const url = new URL(PATHS[target], ZOIE_URL)
  const q = url.searchParams

  q.set('from', 'zoetel')
  q.set('workspace', ctx.workspace)
  q.set('business', ctx.business)
  q.set('country', ctx.country)
  q.set('tz', ctx.timezone)
  q.set('currency', ctx.currency)
  q.set('plan', ctx.plan)
  q.set('lang', ctx.language)
  q.set('customer', ctx.customer)
  q.set('account_type', ctx.accountType)
  q.set('verified', String(ctx.verified))
  if (ctx.numbers.length) q.set('numbers', ctx.numbers.join(','))
  if (ctx.channels.length) q.set('channels', ctx.channels.join(','))
  if (focus?.number) q.set('number', focus.number)

  return url.toString()
}

/**
 * Opens Zoie in a new tab. A new tab rather than a redirect because the
 * customer's infrastructure work here isn't finished — they're stepping
 * sideways into the next part of the same job, not leaving.
 */
export function openZoie(target: ZoieTarget, ctx: ZoieContext, focus?: { number?: string }): void {
  window.open(zoieUrl(target, ctx, focus), '_blank', 'noopener,noreferrer')
}
