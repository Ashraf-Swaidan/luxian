"use client"

import Link from "next/link"

import { LuxianLogo } from "@/components/luxian-logo"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

export function HomeHero() {
  const { user, isLoading } = useAuth()

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card px-6 py-12 sm:px-10 sm:py-14">
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full opacity-40 blur-3xl"
        style={{ background: "var(--luxian-teal)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--luxian-coral)" }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-8 right-1/4 size-40 rounded-full opacity-25 blur-3xl"
        style={{ background: "var(--luxian-amber)" }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex max-w-lg flex-col gap-5">
          <LuxianLogo href="/" size="hero" showWordmark />

          <div className="space-y-3">
            <h1 className="text-3xl font-medium tracking-tight sm:text-4xl">
              Curated essentials, woven with care
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              Discover a focused collection of modern goods. Sign in when you are
              ready to save your cart and complete checkout.
            </p>
          </div>

          <div className="flex min-h-10 flex-wrap items-center gap-3">
            {isLoading ? (
              <div className="h-10 w-32 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <>
                <Link href="/products" className={cn("luxian-cta", "luxian-cta-ring")}>
                  Explore collection
                </Link>
                <Button variant="outline" asChild>
                  <Link href="/cart">View cart</Link>
                </Button>
              </>
            ) : (
              <Link href="/login" className={cn("luxian-cta", "luxian-cta-ring")}>
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
