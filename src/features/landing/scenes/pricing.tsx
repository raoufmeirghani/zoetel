import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/solid'
import { Link } from 'react-router-dom'
import { useI18n } from '@/lib/i18n'
import { money } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Eyebrow, Reveal, Scene, Title } from '../kit'

/**
 * Scene 08 — what it costs.
 *
 * Two cards, and the point of the headline is that neither of them is a form. The
 * left card is the one almost everyone takes; the dark one exists so the reader
 * knows there is a floor under high volume, not to be chosen from a landing page.
 */

/**
 * The entry price comes from the rate table rather than the design file — the
 * prototype said "$0.95 a month", which is below anything the product actually
 * sells. `money()` also formats it in the reader's currency and isolates it for
 * Arabic.
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

  const payg = [
    t('Numbers from {price} a month', { price: money(ENTRY_MONTHLY, 'USD', { trimZeros: false }) }),
    t('Per-second calls, per-message SMS'),
    t('No minimums, no commitment'),
  ]
  const volume = [
    t('Lower per-minute and per-message rates'),
    t('Dedicated routes and named support'),
    t('Regulatory help for new markets'),
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
          <div className="mt-9 grid gap-4 sm:mt-12 lg:grid-cols-2">
            <div className="grid content-start gap-4.5 rounded-[20px] border border-line bg-surface p-6 sm:p-8">
              <Eyebrow>{t('Pay as you go')}</Eyebrow>
              <p>
                <span className="display text-3xl font-semibold tracking-tight text-ink sm:text-[2.5rem]">
                  {money(0, 'USD', { trimZeros: true })}
                </span>
                <span className="text-sm text-ink-faint"> {t('to start · then per use')}</span>
              </p>
              <ul className="grid gap-2.5">
                {payg.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-ink-muted">
                    <Tick tone="light" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                to="/welcome"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-brand-fg shadow-brand transition-colors hover:bg-brand-hover"
              >
                {t('Start free')}
                <ArrowRightIcon className="size-4 opacity-75" />
              </Link>
            </div>

            <div className="grid content-start gap-4.5 rounded-[20px] bg-onyx p-6 sm:p-8">
              <Eyebrow className="!text-white/55">{t('Volume')}</Eyebrow>
              <p>
                <span className="display text-3xl font-semibold tracking-tight text-white sm:text-[2.5rem]">
                  {t('Custom')}
                </span>
                <span className="text-sm text-white/55"> · {t('committed rates')}</span>
              </p>
              <ul className="grid gap-2.5">
                {volume.map((line) => (
                  <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-white/80">
                    <Tick tone="dark" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                to="/pricing"
                className="mt-1 inline-flex w-fit items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-white/[0.18]"
              >
                {t('Talk to sales')}
                <ArrowRightIcon className="size-4 opacity-75" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </Scene>
  )
}
