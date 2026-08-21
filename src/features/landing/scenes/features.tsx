import {
  ArrowsRightLeftIcon,
  ChartBarIcon,
  KeyIcon,
  MagnifyingGlassIcon,
  ServerStackIcon,
} from '@heroicons/react/24/solid'
import { useI18n } from '@/lib/i18n'
import { Eyebrow, Reveal, Scene, Title } from '../kit'

/**
 * Scene 03 — what a number needs.
 *
 * Five cards, one filled icon each. An earlier revision drew a small working
 * fragment of the product in every card — a number list, a SIP panel, a bar
 * chart. They were accurate and they were noise: five miniature interfaces
 * competing with the three real screens one scene later, which is where product
 * surfaces belong. An icon says "this is the category"; the screenshots say
 * "this is the product". Only one of those needs saying twice.
 */

const CARDS = [
  {
    icon: MagnifyingGlassIcon,
    title: 'Live number search',
    body: 'Filter real inventory by country, city, type and capability. Every result carries a published rate and provisions on the spot.',
  },
  {
    icon: ServerStackIcon,
    title: 'SIP that registers first try',
    body: 'Point a trunk at the PBX you already run. Credentials issue on confirm, encrypted end to end by default.',
  },
  {
    icon: ChartBarIcon,
    title: 'Usage you can actually read',
    body: 'Minutes, messages, quality and spend in one view. Per-second metering, published rates, no month-end surprises.',
  },
  {
    icon: ArrowsRightLeftIcon,
    title: 'Route it anywhere',
    body: 'One inbound number, every destination. SIP trunk, REST, webhook, forwarding — or a Zoie AI agent. Changed in a click.',
  },
  {
    icon: KeyIcon,
    title: 'Keys, logs, webhooks',
    body: 'Scoped keys, signed webhooks and every request logged. The same key that buys a number attaches an agent later.',
  },
]

export function FeatureScene() {
  const { t } = useI18n()

  return (
    <Scene id="features" ground="bare" measure="full" className="bg-surface">
      <div className="mx-auto grid max-w-[46rem] justify-items-center text-center">
        <Reveal>
          <Eyebrow tone="brand">{t('Features')}</Eyebrow>
        </Reveal>
        <Reveal delay={0.06}>
          <Title size="md" className="mt-4">
            {t('Everything a phone number needs, in one account')}
          </Title>
        </Reveal>
      </div>

      {/* Five into three columns leaves two on the second row, and centring them
          would break the grid's left edge. Letting the last two span wider keeps
          every card's leading edge on the same line. */}
      <div className="mt-12 grid gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:grid-cols-6">
        {CARDS.map((c, i) => (
          <Reveal key={c.title} delay={0.04 + i * 0.04} className={i < 3 ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <span className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <c.icon className="size-[22px]" />
            </span>
            <h3 className="headline mt-5 text-lg text-ink">{t(c.title)}</h3>
            <p className="mt-2 max-w-[42ch] text-base leading-relaxed text-ink-muted">{t(c.body)}</p>
          </Reveal>
        ))}
      </div>
    </Scene>
  )
}
