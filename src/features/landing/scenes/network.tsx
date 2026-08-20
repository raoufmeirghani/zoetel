import { motion } from 'framer-motion'
import { Cpu, Network, PhoneForwarded, Webhook } from 'lucide-react'
import { formatE164 } from '@/lib/format'
import { useI18n } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { EASE, Scene, Stat, Title } from '../kit'

/**
 * Scene 06 — the infrastructure, drawn.
 *
 * The page's one fully immersive frame: edge to edge, onyx, with the topology
 * rendered as a live diagram rather than described in a list. Signals travel
 * along the paths on a CSS dash animation, so the picture reads as traffic
 * moving through a network instead of as a static graph. Reduced-motion holds
 * them still.
 *
 * The four destinations are the product's actual routing choices, and Zoie is
 * one of them — no larger, no highlighted, exactly as it appears in the app.
 */

const DESTINATIONS = [
  { icon: Network, label: 'SIP trunk', meta: 'Your PBX or softswitch', y: 96 },
  { icon: Webhook, label: 'Webhook', meta: 'Your application answers', y: 176 },
  { icon: PhoneForwarded, label: 'Forwarding', meta: 'A mobile or landline', y: 256 },
  { icon: Cpu, label: 'Zoie agent', meta: 'AI answers and books', y: 336 },
]

export function NetworkScene() {
  const { t } = useI18n()

  return (
    <Scene ground="onyx" measure="tall" edge="fade-y" bleed>
      <div className="mx-auto w-full max-w-[var(--page-max)] px-6 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-[22rem_1fr] lg:gap-20">
          <div>
            <p className="eyebrow text-white/45">{t('05 — The network')}</p>
            <Title size="lg" className="mt-6 !text-white">
              {t('One number. Anywhere you want the call to land.')}
            </Title>
            <p className="mt-6 max-w-[26rem] text-lg leading-relaxed text-white/60">
              {t(
                'Every number terminates on an anycast edge in Cairo or Frankfurt, then hands the call to whatever you point it at. Change the destination and the next call follows it.',
              )}
            </p>

            <div className="mt-12 grid grid-cols-2 gap-8">
              <Stat tone="inverse" value={t('4s')} caption={t('median time to provision a local number')} />
              <Stat tone="inverse" value={t('2')} caption={t('anycast edges, Cairo and Frankfurt')} />
              <Stat tone="inverse" value={t('TLS')} caption={t('signalling, with SRTP on the media')} />
              <Stat tone="inverse" value={t('4')} caption={t('destinations a number can point at')} />
            </div>
          </div>

          <NetworkDiagram destinations={DESTINATIONS} />
        </div>
      </div>
    </Scene>
  )
}

/**
 * The topology. An SVG at a fixed 720×440 viewBox scaled to fit, so the paths
 * stay geometrically exact at every width while the labels sit in HTML on top
 * where they can use the real type stack.
 */
function NetworkDiagram({ destinations }: { destinations: typeof DESTINATIONS }) {
  const { t } = useI18n()

  return (
    <div className="relative">
      <svg
        viewBox="0 0 720 440"
        className="h-auto w-full"
        style={{ direction: 'ltr' }}
        role="img"
        aria-label={t('Inbound call routing from a number through an edge to four destinations')}
      >
        <defs>
          <linearGradient id="net-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(0 0% 100%)" stopOpacity="0.06" />
            <stop offset="45%" stopColor="hsl(0 0% 100%)" stopOpacity="0.18" />
            <stop offset="100%" stopColor="hsl(0 0% 100%)" stopOpacity="0.06" />
          </linearGradient>
          <radialGradient id="net-core" cx="50%" cy="50%">
            <stop offset="0%" stopColor="hsl(var(--brand))" stopOpacity="0.55" />
            <stop offset="100%" stopColor="hsl(var(--brand))" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Inbound: the caller reaching the edge. */}
        <path d="M 40 216 H 250" stroke="url(#net-line)" strokeWidth="1.5" fill="none" />
        <path
          d="M 40 216 H 250"
          stroke="hsl(var(--brand))"
          strokeWidth="1.5"
          fill="none"
          className="signal"
          opacity="0.9"
        />

        {/* The core's glow, behind the node. */}
        <circle cx="290" cy="216" r="88" fill="url(#net-core)" opacity="0.5" />

        {/* Fan-out: edge to each destination, as a rounded elbow. */}
        {destinations.map((d, i) => (
          <g key={d.label}>
            <path
              d={`M 330 216 C 420 216, 420 ${d.y}, 520 ${d.y}`}
              stroke="url(#net-line)"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d={`M 330 216 C 420 216, 420 ${d.y}, 520 ${d.y}`}
              stroke="hsl(var(--brand))"
              strokeWidth="1.5"
              fill="none"
              className="signal"
              opacity="0.85"
              style={{ animationDelay: `${i * -3.5}s` }}
            />
            <circle cx="520" cy={d.y} r="3" fill="hsl(0 0% 100%)" opacity="0.35" />
          </g>
        ))}

        {/* The edge node. */}
        <circle cx="290" cy="216" r="34" fill="hsl(var(--onyx-2))" stroke="hsl(0 0% 100% / 0.14)" />
        <circle cx="290" cy="216" r="5" fill="hsl(var(--brand))" />
        <circle cx="290" cy="216" r="12" fill="none" stroke="hsl(var(--brand))" strokeOpacity="0.35" />
      </svg>

      {/* Labels, positioned as a percentage of the same 720×440 frame. */}
      <span className="absolute start-[2%] top-[49%] hidden -translate-y-1/2 sm:block">
        <span className="block font-mono text-2xs tabular-nums text-white/70">
          {formatE164('+20224618890')}
        </span>
        <span className="block text-2xs text-white/55">{t('inbound')}</span>
      </span>

      <span className="absolute start-[40%] top-[62%] hidden -translate-x-1/2 text-center sm:block rtl:translate-x-1/2">
        <span className="block text-2xs font-medium text-white/70">{t('eg-cai-1')}</span>
        <span className="block text-2xs text-white/55">{t('anycast edge')}</span>
      </span>

      <ul className="mt-6 space-y-3 sm:absolute sm:inset-y-0 sm:end-0 sm:mt-0 sm:flex sm:w-[38%] sm:flex-col sm:justify-center sm:gap-3 sm:space-y-0">
        {destinations.map((d, i) => (
          <motion.li
            key={d.label}
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.09, ease: EASE }}
            className={cn(
              'flex items-center gap-3 rounded-2xl bg-white/[0.04] px-3.5 py-2.5',
              'ring-1 ring-white/[0.07] backdrop-blur-sm',
            )}
          >
            <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-white/75">
              <d.icon className="size-3.5" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-medium text-white">{t(d.label)}</span>
              <span className="block truncate text-2xs text-white/60">{t(d.meta)}</span>
            </span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
