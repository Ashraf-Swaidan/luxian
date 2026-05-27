import { LuxianLogo } from "@/components/luxian-logo"
import { SiteHeaderAuth } from "@/components/site-header-auth"
import { SiteHeaderNav } from "@/components/site-header-nav"

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <LuxianLogo size="md" showWordmark />

        <SiteHeaderNav />

        <SiteHeaderAuth />
      </div>
    </header>
  )
}
