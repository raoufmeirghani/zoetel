import { useI18n } from '@/lib/i18n'
import { CodeTabs } from '../code-tabs'
import { Eyebrow, Reveal, Scene, Title } from '../kit'

/**
 * Scene 07 — the API.
 *
 * One card, centred, on white. Everything the section claims is inside the card,
 * so the copy above it can stay to three lines: the request is the argument.
 */
export function DeveloperScene() {
  const { t } = useI18n()

  return (
    <Scene id="developers" ground="bare" measure="full" className="bg-surface">
      <div className="mx-auto max-w-[62.5rem]">
        <div className="grid justify-items-center text-center">
          <Reveal>
            <Eyebrow tone="brand">{t('Developers')}</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title size="md" className="mt-4 max-w-[22ch]">
              {t('One request buys a number. The rest is yours.')}
            </Title>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-4 max-w-[48ch] text-md leading-relaxed text-ink-muted">
              {t(
                'A single REST surface for numbers, SIP, messaging and voice apps. Idempotent writes, signed webhooks, predictable errors.',
              )}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.16} className="mt-9 sm:mt-12">
          <CodeTabs />
        </Reveal>
      </div>
    </Scene>
  )
}
