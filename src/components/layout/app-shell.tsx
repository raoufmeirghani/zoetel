import * as React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rail } from './rail'
import { MobileDock } from './mobile-dock'
import { TopUtilities } from './utilities'
import { CommandPalette } from './command-palette'
import { MobileIdentity } from './mobile-identity'
import { useHotkeys } from '@/hooks/use-theme'
import { useApp } from '@/store/app'
import { cn } from '@/lib/utils'

export function AppShell() {
  const navPinned = useApp((s) => s.navPinned)
  const [paletteOpen, setPaletteOpen] = React.useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useHotkeys({
    'mod+k': () => setPaletteOpen((v) => !v),
    b: () => navigate('/numbers/buy'),
    g: () => setPaletteOpen(true),
  })

  React.useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [location.pathname])

  return (
    <div className="min-h-dvh overflow-x-clip bg-canvas">
      <Rail />

      {/* The content column clears the floating rail without being boxed by it.
          A *pinned* rail pushes the column across rather than covering it — an
          expanded rail that overlays hides the first column of every table. Hover
          still overlays, because pushing on hover would jitter the whole page. */}
      <div
        className={cn(
          'transition-[padding] duration-300 ease-out',
          navPinned ? 'lg:ps-[calc(264px+1.5rem)]' : 'lg:ps-[calc(76px+1.5rem)]',
        )}
      >
        <div className="page-column relative mx-auto w-full max-w-[var(--page-max)] px-5 sm:px-8 lg:pe-10">
          {/* Chrome floats over the hero rather than sitting in a bar. */}
          <div className="pointer-events-none sticky top-0 z-30 -mx-5 px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
            <div className="flex items-start justify-between gap-3 pb-2 pt-4">
              <MobileIdentity />
              <TopUtilities className="pointer-events-auto ms-auto" onOpenSearch={() => setPaletteOpen(true)} />
            </div>
          </div>

          <main className="pb-28 lg:pb-16">
            {/* Keyed on pathname so each route plays its entrance on mount. No
                AnimatePresence: `mode="wait"` gates the incoming page on the
                outgoing one's exit, and a navigation that interrupts that
                hand-off strands the new page at `initial` — a blank screen. The
                cross-fade isn't worth that risk; the entrance is what reads. */}
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <Outlet />
            </motion.div>
          </main>
        </div>
      </div>

      <MobileDock onOpenSearch={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  )
}
