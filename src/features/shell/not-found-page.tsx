import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Hero } from '@/components/canvas/hero'

export default function NotFoundPage() {
  return (
    <Hero
      mood="quiet"
      size="lg"
      eyebrow={<span className="eyebrow">404</span>}
      title="We couldn’t find that"
      lede="The link may be out of date, or the resource was released. Everything else is exactly where you left it."
      actions={
        <>
          <Button variant="primary" size="lg" asChild icon={<ArrowLeft />}>
            <Link to="/">
              <ArrowLeft className="size-4" />
              Back to overview
            </Link>
          </Button>
          <Button variant="ghost" size="lg" asChild icon={<Compass />}>
            <Link to="/numbers">
              <Compass className="size-4" />
              Phone numbers
            </Link>
          </Button>
        </>
      }
    />
  )
}
