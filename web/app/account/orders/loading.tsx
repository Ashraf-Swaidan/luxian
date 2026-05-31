import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl space-y-3 px-6 py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-20 w-full rounded-md" />
      <Skeleton className="h-20 w-full rounded-md" />
    </main>
  )
}
