import { LuxianLogo } from "@/components/layout/luxian-logo"
import { SiteHeaderAuth } from "@/components/layout/site-header-auth"
import { SiteHeaderNav } from "@/components/layout/site-header-nav"
import { StoreShell } from "@/components/layout/store-shell"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/95 backdrop-blur-md">
      <StoreShell className="flex h-16 items-center justify-between gap-4">
        <LuxianLogo size="md" showWordmark />

        <div className="flex items-center gap-2 sm:gap-4">
          <SiteHeaderNav />
          <div className="h-6 w-px bg-border/80" aria-hidden />
          <SiteHeaderAuth />
        </div>
      </StoreShell>
    </header>
  )
}
