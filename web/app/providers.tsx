"use client"

import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/providers/query-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      {children}
      <Toaster richColors closeButton />
    </QueryProvider>
  )
}
