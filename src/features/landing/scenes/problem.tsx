import { motion } from 'framer-motion'
import { useI18n } from '@/lib/i18n'
import { EASE, Glow, LineWipe, Reveal, Scene, Title } from '../kit'

/**
 * Scene 02 — the problem.
 *
 * Deliberately almost empty. One sentence at the largest type on the page, and
 * three dated fragments of what buying a phone number is normally like, set
 * small and scattered off the baseline grid.
 *
 * The composition is the argument: a huge claim with almost nothing to support
 * it reads as confidence, and the receipts in the margin are what make it land.
 */

const RECEIPTS = [
  { when: 'Day 1', what: 'Enquiry form submitted. Auto-reply promises a response in 48 hours.' },
  { when: 'Day 9', what: 'Quote arrives as a PDF. Rates per destination are “available on request”.' },
  { when: 'Week 4', what: 'Numbers provisioned. Two are wrong. Routing needs a ticket.' },
]

export function ProblemScene() {
  const { t } = useI18n()

  return (
    <Scene measure="tall" ground="bare">
      <div className="relative">
        <Glow x="82%" y="26%" size="38rem" tint="356 72% 51%" opacity={0.1} />

        <Title as="h2" size="xl" balance={false} className="max-w-[46rem]">
          <LineWipe>{t('Buying a phone number')}</LineWipe>
          <LineWipe delay={0.08}>{t('still takes a month.')}</LineWipe>
        </Title>

        {/* The receipts hang off the right of the column at increasing indents,
            like marginalia. On a phone they collapse into a plain sequence. */}
        <div className="mt-20 grid gap-10 lg:mt-28 lg:grid-cols-12">
          {RECEIPTS.map((r, i) => (
            <motion.div
              key={r.when}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 0.65, delay: i * 0.12, ease: EASE }}
              className={
                [
                  'lg:col-span-4 lg:col-start-2',
                  'lg:col-span-4 lg:col-start-5 lg:mt-16',
                  'lg:col-span-4 lg:col-start-8 lg:mt-32',
                ][i]
              }
            >
              <p className="font-mono text-2xs uppercase tracking-[0.14em] text-ink-faint">{t(r.when)}</p>
              <p className="mt-3 text-lg leading-relaxed text-ink-subtle">{t(r.what)}</p>
            </motion.div>
          ))}
        </div>

        <Reveal delay={0.1} className="mt-24 lg:mt-36">
          <p className="text-balance text-2xl leading-snug text-ink sm:text-3xl">
            {t('None of that is the regulation. All of it is the vendor.')}
          </p>
        </Reveal>
      </div>
    </Scene>
  )
}

/* ── Scene 03 · philosophy ─────────────────────────────────────────────── */

const PRINCIPLES = [
  {
    n: '01',
    title: 'Inventory, not enquiries',
    body: 'Carrier stock is a searchable list with prices on it. If a number is free you can see it, and if it is free you can have it.',
  },
  {
    n: '02',
    title: 'Prepaid, never invoiced by surprise',
    body: 'A wallet you top up and watch drain per second. Calls stop at zero. Nothing arrives at the end of the month that you did not already know about.',
  },
  {
    n: '03',
    title: 'Compliance stated up front',
    body: 'Regulated ranges say what they need before you reach checkout. One verification, three minutes, every range unlocked permanently.',
  },
  {
    n: '04',
    title: 'The API is the product',
    body: 'Everything this interface does, a request can do. No feature exists here that you cannot reach from your own code.',
  },
]

/**
 * Scene 03 — why the product exists.
 *
 * A manifesto set on drafting paper. The numerals carry the composition at
 * display scale and the statements sit small beside them, alternating which side
 * of the grid they hang from so the eye zig-zags down instead of marching.
 */
export function PhilosophyScene() {
  const { t } = useI18n()

  return (
    <Scene ground="grid" measure="full" edge="fade-y">
      <Reveal>
        <p className="eyebrow">{t('02 — What we built instead')}</p>
        <Title size="lg" className="mt-6 max-w-[38rem]">
          {t('Four decisions, and the rest follows.')}
        </Title>
      </Reveal>

      <div className="mt-24 space-y-20 lg:mt-32 lg:space-y-28">
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.n} delay={0.04}>
            {/* The alternation lives in the column starts below, not here. */}
            <div className="grid gap-6 lg:grid-cols-12 lg:items-baseline">
              <p
                className={[
                  'display text-6xl leading-none text-ink/[0.13] sm:text-7xl',
                  i % 2 === 0 ? 'lg:col-span-2' : 'lg:col-span-2 lg:col-start-6 lg:text-end',
                ].join(' ')}
              >
                {p.n}
              </p>
              <div
                className={[
                  'min-w-0',
                  i % 2 === 0 ? 'lg:col-span-6 lg:col-start-4' : 'lg:col-span-5 lg:col-start-8',
                ].join(' ')}
              >
                <h3 className="headline text-2xl text-ink sm:text-3xl">{t(p.title)}</h3>
                <p className="mt-4 max-w-[32rem] text-lg leading-relaxed text-ink-muted">{t(p.body)}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Scene>
  )
}
