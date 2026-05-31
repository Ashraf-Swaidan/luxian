import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl space-y-4 px-6 py-10">
      <Skeleton className="h-8 w-40" />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <Skeleton className="h-48 w-full rounded-md" />
        <Skeleton className="h-40 w-full rounded-md" />
      </div>
    </main>
  )
}
