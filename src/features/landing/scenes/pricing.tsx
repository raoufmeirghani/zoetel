import {
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { useI18n } from '@/lib/i18n'
import { money } from '@/lib/format'
import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'
import { Eyebrow, Reveal, Scene, Title } from '../kit'

/**
 * Scene 08 — what it costs.
 *
 * The two plans are the application's own, copied from `pricing/pricing-page.tsx`
 * rather than written for the landing page: same names, same taglines, same
 * anchors, same six lines each. A visitor who reads this and then signs up
 * should find the identical two cards inside the product, and the prototype's
 * invented "$0.95 a month" is exactly the kind of drift that breaks that.
 *
 * The rate itself comes from the rate table via `money()`, so it follows the
 * reader's display currency instead of being hard-coded in dollars.
 */

const ENTRY_MONTHLY = 1.1

function Tick({ tone }: { tone: 'light' | 'dark' }) {
  return (
    <CheckCircleIcon
      className={cn('mt-0.5 size-[18px] shrink-0', tone === 'light' ? 'text-brand' : 'text-[hsl(249_88%_78%)]')}
    />
  )
}

export function PricingScene() {
  const { t } = useI18n()
  const currency = useApp((s) => s.workspace.currency)

  const PLANS = [
    {
      kind: 'payg' as const,
      icon: RocketLaunchIcon,
      name: t('Pay as you go'),
      tagline: t('Perfect for startups and first integrations'),
      price: t('No commitment'),
      priceSub: t('Top up your wallet, pay only for what you use'),
      features: [
        t('Numbers from {price}/month', { price: money(ENTRY_MONTHLY, currency) }),
        t('Per-second voice billing'),
        t('All API and SIP features included'),
        t('Unlimited API keys and webhooks'),
        t('Community and email support'),
        t('Cancel or pause any time'),
      ],
      cta: t('Start free'),
      to: '/welcome',
    },
    {
      kind: 'volume' as const,
      icon: ArrowTrendingDownIcon,
      name: t('Volume pricing'),
      tagline: t('For teams with predictable monthly traffic'),
      price: t('Up to 24% lower'),
      priceSub: t('Committed monthly minutes at discounted rates'),
      features: [
        t('Automatic tier discounts up to 24%'),
        t('Dedicated carrier routes and priority capacity'),
        t('Named technical account manager'),
        t('Custom SLA with quality guarantees'),
        t('Monthly invoicing with net-30 terms'),
        t('SSO, audit exports and role policies'),
      ],
      cta: t('Talk to sales'),
      to: '/pricing',
    },
  ]

  return (
    <Scene id="pricing" ground="bare" measure="full" className="border-t border-line-soft bg-surface-3">
      <div className="mx-auto max-w-[62.5rem]">
        <div className="grid justify-items-center text-center">
          <Reveal>
            <Eyebrow tone="brand">{t('Pricing')}</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title size="md" className="mt-4 max-w-[20ch]">
              {t('Two ways to pay. Neither needs a meeting.')}
            </Title>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12 grid gap-4 sm:mt-16 lg:grid-cols-2">
            {PLANS.map((p) => {
              const dark = p.kind === 'volume'
              return (
                <div
                  key={p.kind}
                  className={cn(
                    'grid content-start gap-5 rounded-[20px] p-6 sm:p-8',
                    dark ? 'bg-onyx' : 'border border-line bg-surface',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        'grid size-10 shrink-0 place-items-center rounded-xl',
                        dark ? 'bg-white/10 text-[hsl(249_88%_78%)]' : 'bg-brand-soft text-brand',
                      )}
                    >
                      <p.icon className="size-[18px]" />
                    </span>
                    <span className="min-w-0">
                      <Eyebrow className={cn(dark && '!text-white/55')}>{p.name}</Eyebrow>
                      <p className={cn('mt-1 text-sm', dark ? 'text-white/55' : 'text-ink-subtle')}>
                        {p.tagline}
                      </p>
                    </span>
                  </div>

                  <p>
                    <span
                      className={cn(
                        'display text-3xl font-semibold tracking-tight sm:text-[2.5rem]',
                        dark ? 'text-white' : 'text-ink',
                      )}
                    >
                      {p.price}
                    </span>
                  </p>
                  <p className={cn('-mt-3 text-sm', dark ? 'text-white/55' : 'text-ink-subtle')}>
                    {p.priceSub}
                  </p>

                  <ul className="grid gap-2.5">
                    {p.features.map((line) => (
                      <li
                        key={line}
                        className={cn(
                          'flex gap-2.5 text-sm leading-relaxed',
                          dark ? 'text-white/80' : 'text-ink-muted',
                        )}
                      >
                        <Tick tone={dark ? 'dark' : 'light'} />
                        {line}
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={p.to}
                    className={cn(
                      'mt-1 inline-flex w-fit items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-colors',
                      dark
                        ? 'border border-white/20 bg-white/10 text-white hover:bg-white/[0.18]'
                        : 'bg-brand text-brand-fg shadow-brand hover:bg-brand-hover',
                    )}
                  >
                    {p.cta}
                    <ArrowRightIcon className="size-4 opacity-75" />
                  </Link>
                </div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </Scene>
  )
}
