import {
  ArrowUpRightIcon,
  ArrowUturnRightIcon,
  ArrowsRightLeftIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  PhoneArrowDownLeftIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import { useI18n } from '@/lib/i18n'
import { openZoie, useZoieContext } from '@/lib/zoie'
import { Eyebrow, Reveal, Title } from '../kit'

/**
 * Scene 05 — the AI layer.
 *
 * A deliberate mirror of the product scene: same ground, same window treatment,
 * flipped. That is the argument in the composition — Zoie is not a tier above the
 * platform, it is the same platform with the call handed somewhere else.
 *
 * The screen is the routing panel, which already lists "An AI voice agent" beside
 * "My own PBX or softswitch". The product makes the case; the copy only frames it.
 */

const ROWS = [
  { icon: PhoneArrowDownLeftIcon, label: 'AI voice agents', meta: 'inbound · outbound' },
  { icon: ChatBubbleLeftRightIcon, label: 'AI SMS & WhatsApp', meta: 'conversational' },
  { icon: CalendarDaysIcon, label: 'Appointment booking', meta: 'calendar' },
  { icon: UserGroupIcon, label: 'Lead qualification', meta: 'scoring' },
  { icon: ArrowsRightLeftIcon, label: 'CRM sync', meta: 'two-way' },
  { icon: ArrowUturnRightIcon, label: 'Human handoff', meta: 'warm transfer' },
]

export function ZoieScene() {
  const { t } = useI18n()
  const zoie = useZoieContext()

  return (
    <section id="zoie" className="relative isolate overflow-hidden bg-onyx py-28 sm:py-40 lg:py-48">
      <span
        aria-hidden
        className="pointer-events-none absolute -start-[8%] top-[6%] -z-10 h-[88%] w-[74%]"
        style={{
          background: 'radial-gradient(46% 46% at 50% 50%, hsl(var(--brand) / 0.42), transparent 70%)',
        }}
      />

      <div className="mx-auto grid max-w-[80rem] items-center gap-8 pe-6 sm:pe-8 lg:grid-cols-[minmax(0,1fr)_minmax(17.5rem,26.25rem)] lg:gap-14">
        <Reveal className="min-w-0 max-lg:order-2 max-lg:ps-6 max-sm:ps-0 lg:-ms-[clamp(40px,9vw,140px)]">
          <div
            className="overflow-hidden rounded-e-2xl border border-s-0 border-white/15 max-lg:rounded-s-2xl max-lg:border-s"
            style={{
              boxShadow: '0 50px 110px -50px rgb(0 0 0 / 0.9), 0 0 120px -60px hsl(var(--brand) / 0.75)',
            }}
          >
            <img
              src="/screens/routing.png"
              alt={t("Choosing an AI voice agent as a number's destination")}
              loading="lazy"
              dir="ltr"
              className="block h-auto w-full"
            />
          </div>
        </Reveal>

        <div className="grid gap-5 ps-6 max-lg:order-1 sm:gap-7 sm:ps-8 lg:ps-0">
          <div>
            <Reveal>
              <Eyebrow tone="inverse">{t('Zoie · AI layer')}</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title size="sm" className="mt-3.5 !text-white sm:text-4xl">
                {t('Or hand the call to an agent.')}
              </Title>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-4 text-md leading-relaxed text-white/55">
                {t(
                  'Every number you provision can route to Zoie instead of a PBX — it answers, understands, books and escalates. Same number, same routing screen, one more destination.',
                )}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.16}>
            <ul className="grid">
              {ROWS.map((r) => (
                <li
                  key={r.label}
                  className="flex items-center gap-3 border-b border-white/10 py-3 text-sm font-medium text-white"
                >
                  <r.icon className="size-4 shrink-0 text-[hsl(249_88%_78%)]" />
                  {t(r.label)}
                  <span className="eyebrow ms-auto font-mono tracking-[0.11em] !text-white/40">
                    {t(r.meta)}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.2}>
            <button
              type="button"
              onClick={() => openZoie('voice-agent', zoie)}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-medium text-brand-fg shadow-brand transition-colors hover:bg-brand-hover"
            >
              {t('Open Zoie')}
              <ArrowUpRightIcon className="size-4 opacity-80" />
            </button>
            {/* Kept verbatim. Zoie's separateness has to be stated plainly on
                the page, not implied by an icon on the button. */}
            <p className="eyebrow mt-4 font-mono normal-case leading-relaxed tracking-[0.11em] !text-white/35">
              {t('Separate product · opens in a new tab · runs on your Zoetel numbers')}
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
