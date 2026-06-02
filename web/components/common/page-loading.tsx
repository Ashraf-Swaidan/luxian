import { Skeleton } from "@/components/ui/skeleton"
import { StoreShell } from "@/components/layout/store-shell"

export function PageLoading() {
  return (
    <main className="py-8 sm:py-12">
      <StoreShell>
        <div className="mb-8 space-y-3">
          <Skeleton className="h-8 w-56 sm:h-9 sm:w-72" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] w-full rounded-md" />
          ))}
        </div>
      </StoreShell>
    </main>
  )
}
