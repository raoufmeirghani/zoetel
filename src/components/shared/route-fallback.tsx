import { Skeleton } from '@/components/ui/skeleton'

export function RouteFallback() {
  return (
    <div className="mx-auto w-full max-w-[86rem] px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-52 rounded-lg" />
      <Skeleton className="mt-3 h-4 w-80 rounded-md" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-2xl" />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    </div>
  )
}
