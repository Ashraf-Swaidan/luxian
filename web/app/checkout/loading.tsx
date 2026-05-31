import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-6 py-10">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-14 w-64" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_25rem]">
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <Skeleton className="h-16 w-full sm:h-24" />
            <Skeleton className="h-16 w-full sm:h-24" />
            <Skeleton className="h-16 w-full sm:h-24" />
          </div>
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    </main>
  )
}
