import { CARRIERS } from '@/components/shared/carrier-avatar'
import { useI18n } from '@/lib/i18n'

/**
 * Scene 02 — the carriers.
 *
 * A trust strip with no label on it. The claim being made is that these are real
 * licensed ranges, and five carrier marks make that claim better than a sentence
 * saying so would.
 *
 * Squares rather than the circles `CarrierAvatar` draws: Orange and du are square
 * lockups, and a circular crop slices through both.
 */

/**
 * Three of these are the app's own `CarrierId`s and come from the shared table.
 * Orange and du are ranges Zoetel resells but never attributes to a number, so
 * they have no id in the product — they exist here and nowhere else.
 */
const MARKS = [
  { name: CARRIERS.we.name, src: CARRIERS.we.src, inset: '' },
  { name: CARRIERS.vodafone.name, src: CARRIERS.vodafone.src, inset: 'p-[3px]' },
  { name: CARRIERS.etisalat.name, src: CARRIERS.etisalat.src, inset: '' },
  { name: 'Orange', src: '/carriers/orange.png', inset: '' },
  { name: 'du', src: '/carriers/du.png', inset: '' },
]

export function CarrierScene() {
  const { t } = useI18n()

  return (
    <section
      aria-label={t('Carrier partners')}
      // No top hairline: this strip follows the hero's dark plane, where the
      // tonal jump is the edge and a pale rule on top of it would be a seam.
      //
      // The ground sits on the section and the mask sits on the layer inside it.
      // They used to be the same element, which was fine while the document
      // behind was light — the moment it went dark, the mask's own fade-to-
      // transparent at each end started revealing it as two dark slivers.
      className="page-ground relative overflow-hidden"
    >
      <div
        className="relative overflow-hidden py-6 sm:py-8"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent)',
        }}
      >
        <span aria-hidden className="glass pointer-events-none absolute inset-0 rounded-none" />

        {/* Forced `ltr` because the track's geometry — a doubled row translated
            by half its width — depends on which edge it starts from, and a row
            of logos has no reading order to preserve. In Arabic the travel
            direction reverses instead, so it still runs with the page. */}
        <div
          dir="ltr"
          className="relative flex w-max animate-marquee items-center gap-10 sm:gap-16 lg:gap-20 rtl:[animation-direction:reverse]"
          style={{ animationDuration: '38s' }}
        >
          {/* Rendered twice: the -50% translate only loops seamlessly if the
            second half is an exact copy of the first. */}
          {[...MARKS, ...MARKS].map((c, i) => (
            <span key={`${c.name}-${i}`} className="inline-flex shrink-0 items-center gap-3">
              <img
                src={c.src}
                alt=""
                aria-hidden
                className={`size-9 shrink-0 rounded-[10px] bg-white object-contain ${c.inset}`}
              />
              <span className="headline whitespace-nowrap text-lg font-medium text-ink-muted">{c.name}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
