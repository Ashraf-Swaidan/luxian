"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"

import { SiteHeaderAuth } from "@/components/layout/site-header-auth"
import { SiteHeaderNav } from "@/components/layout/site-header-nav"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  return <SiteHeaderFrame key={pathname} isAdmin={isAdmin} pathname={pathname} />
}

type SiteHeaderFrameProps = {
  isAdmin: boolean
  pathname: string
}

function SiteHeaderFrame({ isAdmin, pathname }: SiteHeaderFrameProps) {
  const isHome = pathname === "/"
  const [hideHeader, setHideHeader] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollY = useRef(0)
  const heroAtTop = isHome && !isScrolled

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY
      const isScrollingDown = currentScrollY > lastScrollY.current
      const hideThreshold = isHome ? window.innerHeight - 96 : 96

      setHideHeader(isScrollingDown && currentScrollY > hideThreshold)
      setIsScrolled(currentScrollY > 24)
      lastScrollY.current = currentScrollY
    }

    window.addEventListener("scroll", onScroll, { passive: true })

    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome])

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,transform] duration-300 ease-out",
          heroAtTop
            ? "border-transparent bg-transparent"
            : "border-border/60 bg-background/95 backdrop-blur-md",
          hideHeader && "-translate-y-full",
        )}
      >
        <div
          className={cn(
            "mx-auto grid h-16 w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6",
            isHome ? "max-w-none lg:px-10" : "max-w-7xl",
          )}
        >
          <Link
            href="/"
            className="inline-flex min-w-0 items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Image
              src="/luxian-logo.png"
              alt=""
              width={38}
              height={38}
              className="size-9 shrink-0 sm:size-10"
              priority={isHome}
              aria-hidden
            />
            <span
              className={cn(
                "font-display text-lg font-bold uppercase leading-none max-[420px]:hidden sm:text-xl",
                heroAtTop ? "text-neutral-950" : "text-foreground",
              )}
            >
              LUXIAN
            </span>
          </Link>

          <div className="flex justify-center">
            <SiteHeaderNav hero={heroAtTop} showAdmin={false} />
          </div>

          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className={cn(
                  "hidden rounded-md px-3 py-2 text-sm transition-colors sm:flex",
                  heroAtTop
                    ? "text-neutral-950/75 hover:bg-white/45 hover:text-neutral-950"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                Admin
              </Link>
            )}
            <div
              className={cn("h-6 w-px", heroAtTop ? "bg-neutral-950/15" : "bg-border/80")}
              aria-hidden
            />
            <SiteHeaderAuth hero={heroAtTop} />
          </div>
        </div>
      </header>
      {!isHome && <div className="h-16 sm:h-20" aria-hidden />}
    </>
  )
}
