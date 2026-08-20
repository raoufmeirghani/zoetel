import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/lib/i18n'
import { EASE, Glow, Reveal, Scene, Title } from '../kit'
import { CodeTabs } from '../code-tabs'

/**
 * Scene 08 — the developer experience, composed in layers.
 *
 * The request runs off the leading edge of the column, and the webhook that
 * follows it overlaps its lower corner. That overlap is the point being made:
 * one call out, one call back, and the two are part of the same object. Nothing
 * here sits in a row beside a paragraph.
 *
 * The copy is pushed high and small against the code's mass, so the scene reads
 * dense where the rest of the page reads open.
 */
export function DeveloperScene() {
  const { t } = useI18n()

  return (
    <Scene id="developers" ground="paper" measure="full" edge="fade-y">
      <Glow x="12%" y="8%" size="40rem" opacity={0.3} />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
        {/* Copy: a narrow column pushed to the trailing side and set high. */}
        <div className="min-w-0 lg:col-span-4 lg:col-start-9 lg:pt-10">
          <Reveal>
            <p className="eyebrow">{t('07 — Build on it')}</p>
            <Title size="md" className="mt-5">
              {t('Two calls and you are done.')}
            </Title>
            <p className="mt-5 text-lg leading-relaxed text-ink-muted">
              {t(
                'Place the call with one request. We POST every event back, signed and retried, until your endpoint acknowledges it.',
              )}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <dl className="mt-9 space-y-4 border-t border-line-soft pt-7">
              {[
                ['Idempotent by key', 'Retry a create safely; you will not place two calls.'],
                ['Signed webhooks', 'HMAC per delivery, with a replay window you control.'],
                ['Every request logged', 'Status, latency and full body, retained 30 days.'],
              ].map(([label, meta]) => (
                <div key={label}>
                  <dt className="text-base font-medium text-ink">{t(label)}</dt>
                  <dd className="mt-0.5 text-base leading-relaxed text-ink-subtle">{t(meta)}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.15}>
            <Button variant="ghost" size="lg" className="-ms-4 mt-8" asChild>
              <Link to="/developers">
                {t('API reference')}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Reveal>
        </div>

        {/* Code: cropped off the leading edge so it reads as part of something
            larger than the column. */}
        <div className="relative min-w-0 lg:col-span-8 lg:col-start-1 lg:row-start-1">
          <Reveal>
            <div className="lg:-ms-16 xl:-ms-24">
              <CodeTabs />
            </div>
          </Reveal>

          {/* The callback, overlapping the request's lower corner. */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.65, delay: 0.2, ease: EASE }}
            className="relative z-10 -mt-8 ms-auto w-[92%] sm:-mt-10 sm:w-[76%] lg:w-[64%]"
            /* Overlaps the request panel, not the copy column — a card that
               covers a sentence is a bug wearing a layout's clothes. */
          >
            <WebhookCard />
          </motion.div>
        </div>
      </div>
    </Scene>
  )
}

/**
 * The event coming back. Rendered as the log renders it — method, path, status,
 * latency — rather than as a prose description of webhooks.
 */
function WebhookCard() {
  const { t } = useI18n()

  return (
    <div className="relative">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 -bottom-5 h-16 rounded-[50%] bg-ink/[0.09] blur-2xl"
      />
      <div className="glass relative overflow-hidden rounded-[20px] shadow-xl dark:ring-1 dark:ring-white/[0.07]">
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-2.5">
          <span className="eyebrow">{t('Your endpoint, 40 ms later')}</span>
          <span className="flex items-center gap-1.5 text-xs font-medium text-success-ink">
            <CheckCircle2 className="size-3.5" />
            {t('200 OK')}
          </span>
        </div>
        <pre
          dir="ltr"
          className="ltr-island overflow-x-auto px-4 py-4 font-mono text-[12px] leading-[1.7] text-ink-muted"
        >
          <code>
            {`POST /voice/answer\n`}
            {`{\n`}
            {`  "event": `}
            <span className="text-success-ink">"call.answered"</span>
            {`,\n`}
            {`  "call_id": `}
            <span className="text-success-ink">"cal_9k2f1"</span>
            {`,\n`}
            {`  "from": `}
            <span className="text-success-ink">"+20224618890"</span>
            {`,\n`}
            {`  "signature": `}
            <span className="text-brand-ink">"t=1724…,v1=6b3f…"</span>
            {`\n}`}
          </code>
        </pre>
      </div>
    </div>
  )
}
