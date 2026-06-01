"use client"

import Image from "next/image"
import Link from "next/link"
import { useSyncExternalStore } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { StoreImage } from "@/components/common/store-image"
import type { HomepageSettings } from "@/lib/types/homepage"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils"

const HERO_THUMBNAIL_QUERY = "(min-width: 640px)"

const HERO_DEFAULTS = {
  imageUrl: "/hero-assets/hero-model2.png",
  wordmark: "LUXIAN",
  eyebrow: "Luxian",
  heading: "Sculptural streetwear",
  tagline: "Technical essentials with sculptural volume and everyday edge.",
} as const

export type HomeHeroSettings = Pick<
  HomepageSettings,
  "heroImageUrl" | "heroWordmark" | "heroEyebrow" | "heroHeading" | "heroTagline"
>

export function HomeHero({
  products,
  settings,
}: {
  products: Product[]
  settings?: HomeHeroSettings | null
}) {
  const showDesktopThumbnails = useSyncExternalStore(
    subscribeToThumbnailViewport,
    getThumbnailViewportSnapshot,
    getThumbnailViewportServerSnapshot
  )

  const heroImageUrl = settings?.heroImageUrl ?? HERO_DEFAULTS.imageUrl
  const heroWordmark = settings?.heroWordmark ?? HERO_DEFAULTS.wordmark
  const heroEyebrow = settings?.heroEyebrow ?? HERO_DEFAULTS.eyebrow
  const heroHeading = settings?.heroHeading ?? HERO_DEFAULTS.heading
  const heroTagline = settings?.heroTagline ?? HERO_DEFAULTS.tagline

  return (
    <section className="relative isolate min-h-svh overflow-hidden bg-[oklch(0.89_0.03_92)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,oklch(0.94_0.018_95)_0%,oklch(0.86_0.036_88)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,oklch(0.8_0.045_84_/_0.72))]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-svh flex-col sm:hidden">
        <div className="px-5 pt-[calc(4.25rem+env(safe-area-inset-top,0px))]">
          <p className="text-[0.6875rem] font-semibold tracking-[0.32em] text-neutral-950/50 uppercase">{heroEyebrow}</p>
          <h1 className="mt-2 max-w-[12ch] font-display text-[clamp(2.35rem,10.5vw,3.1rem)] leading-[0.92] font-bold text-neutral-950 uppercase">
            {heroHeading}
          </h1>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col justify-end">
          <div
            className="pointer-events-none absolute inset-x-0 top-[6%] flex justify-center overflow-hidden px-6 select-none"
            aria-hidden
          >
            <span className="font-display text-[clamp(4.75rem,26vw,7rem)] leading-none font-bold text-neutral-950/[0.1] uppercase">
              {heroWordmark}
            </span>
          </div>

          <div className="relative mx-auto min-h-[14rem] w-full max-w-[22rem] flex-1 max-h-[min(56vh,28rem)] px-4">
            <HeroModelImage
              src={heroImageUrl}
              className="object-contain object-bottom drop-shadow-[0_18px_40px_rgba(32,28,20,0.22)]"
              sizes="(max-width: 640px) 88vw, 352px"
            />
          </div>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-[linear-gradient(180deg,transparent_0%,oklch(0.86_0.038_88_/_0.55)_55%,oklch(0.82_0.042_86_/_0.92)_100%)]"
            aria-hidden
          />
        </div>

        <div className="relative z-20 shrink-0 space-y-4 px-5 pt-1 pb-[max(1.25rem,env(safe-area-inset-bottom,0px))]">
          <p className="max-w-[20rem] text-sm leading-relaxed text-neutral-950/72">{heroTagline}</p>

          <HeroShopLink className="h-12 w-full justify-center px-5 text-sm font-semibold shadow-[0_18px_42px_rgba(32,28,20,0.16)]" />
        </div>
      </div>

      <div
        className="pointer-events-none absolute top-[9svh] left-1/2 z-0 hidden w-max -translate-x-1/2 items-center justify-center select-none sm:flex lg:top-[6svh]"
        aria-hidden
      >
        <span
          className={cn(
            "font-display text-[27vw] leading-none font-bold whitespace-nowrap text-neutral-950/[0.88] uppercase lg:text-[20vw]"
          )}
        >
          {heroWordmark}
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 hidden h-full items-end justify-center sm:flex">
        <div className="relative h-[86svh] min-h-[540px] w-[min(112vw,900px)] lg:h-[88svh] lg:w-[min(74vw,1040px)]">
          <HeroModelImage
            src={heroImageUrl}
            className="object-contain object-bottom drop-shadow-[0_28px_60px_rgba(32,28,20,0.28)]"
            sizes="(max-width: 768px) 112vw, 1040px"
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] hidden h-36 bg-[linear-gradient(180deg,transparent,oklch(0.78_0.045_84_/_0.72))] sm:block"
        aria-hidden
      />

      <div className="absolute bottom-10 left-8 z-20 hidden max-w-sm sm:block lg:left-12">
        <HeroShopLink />
        <p className="mt-3 text-sm leading-relaxed text-neutral-950/70">
          Technical streetwear essentials with sculptural volume, clean utility, and everyday edge.
        </p>
      </div>

      {showDesktopThumbnails && products.length > 0 && (
        <div className="absolute right-4 bottom-10 z-20 grid grid-cols-2 grid-rows-2 gap-3 lg:right-10 lg:bottom-14">
          {products.slice(0, 3).map((product, index) => (
            <HeroProductThumb key={product.id} product={product} index={index} className="size-16 lg:size-20" />
          ))}
        </div>
      )}
    </section>
  )
}

function HeroModelImage({
  src,
  className,
  sizes,
}: {
  src: string
  className?: string
  sizes: string
}) {
  return (
    <StoreImage
      src={src}
      alt="Model wearing Luxian streetwear"
      fill
      priority
      className={className}
      sizes={sizes}
    />
  )
}

function HeroShopLink({ className }: { className?: string }) {
  return (
    <Link
      href="/products"
      className={cn(
        "inline-flex h-11 items-center gap-2.5 rounded-md bg-white px-4 pr-5 text-sm font-medium text-neutral-950 transition-all hover:-translate-y-0.5 hover:brightness-[0.98] focus-visible:ring-2 focus-visible:ring-neutral-950/20 focus-visible:outline-none",
        className
      )}
    >
      <Image src="/luxian-logo.png" alt="" width={22} height={22} className="shrink-0 rounded-sm" aria-hidden />
      <span>Shop now</span>
      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 opacity-60" strokeWidth={2} aria-hidden />
    </Link>
  )
}

function HeroProductThumb({
  product,
  index,
  className,
}: {
  product: Product
  index: number
  className?: string
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className={cn(
        "group relative overflow-hidden rounded-md transition-transform hover:-translate-y-1",
        className,
        index === 0 && "col-start-1 row-start-2",
        index === 1 && "col-start-2 row-start-2",
        index === 2 && "col-start-2 row-start-1"
      )}
      title={product.name}
    >
      {product.imageUrl ? (
        <StoreImage src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="80px" />
      ) : (
        <div className="flex h-full items-center justify-center rounded-md bg-white/70 p-1 text-center text-[9px] font-medium tracking-wide text-neutral-950/55 uppercase">
          {product.name.slice(0, 12)}
        </div>
      )}
    </Link>
  )
}

function subscribeToThumbnailViewport(onStoreChange: () => void) {
  const media = window.matchMedia(HERO_THUMBNAIL_QUERY)

  media.addEventListener("change", onStoreChange)

  return () => media.removeEventListener("change", onStoreChange)
}

function getThumbnailViewportSnapshot() {
  return window.matchMedia(HERO_THUMBNAIL_QUERY).matches
}

function getThumbnailViewportServerSnapshot() {
  return false
}
