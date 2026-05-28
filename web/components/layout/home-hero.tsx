"use client"

import Link from "next/link"

import { LuxianLogo } from "@/components/luxian-logo"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

export function HomeHero() {
  const { user, isLoading } = useAuth()

  return (
    <section className="relative grid min-h-[420px] overflow-hidden rounded-3xl border border-border/50 bg-gradient-to-br from-card via-background to-muted/40 lg:grid-cols-2">
      <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--luxian-teal)]">
          New season
        </p>
        <h1 className="max-w-md text-4xl font-medium leading-[1.1] tracking-tight sm:text-5xl">
          Essentials for everyday luxury
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground sm:text-base">
          A curated shop of modern goods. Add to your bag in one click — checkout when you are ready.
        </p>
        <div className="flex min-h-10 flex-wrap items-center gap-3">
          {isLoading ? (
            <div className="h-10 w-36 animate-pulse rounded-full bg-muted" />
          ) : (
            <>
              <Link href="/products" className={cn("luxian-cta", "luxian-cta-ring")}>
                Shop collection
              </Link>
              {!user && (
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center rounded-full border border-border px-6 text-sm font-medium transition-colors hover:bg-muted"
                >
                  Sign in
                </Link>
              )}
            </>
          )}
        </div>
      </div>

      <div className="relative hidden items-center justify-center p-8 lg:flex">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "radial-gradient(circle at 70% 50%, var(--luxian-teal), transparent 55%), radial-gradient(circle at 30% 80%, var(--luxian-coral), transparent 45%)",
          }}
          aria-hidden
        />
        <LuxianLogo href="/" size="hero" showWordmark className="relative scale-110" />
      </div>
    </section>
  )
}
