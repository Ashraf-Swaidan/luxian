"use client"

import Image from "next/image"
import Link from "next/link"
import { useSyncExternalStore } from "react"
import { useQuery } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { StoreImage } from "@/components/common/store-image"
import { Skeleton } from "@/components/ui/skeleton"
import { getProducts } from "@/features/products/api"
import { queryKeys } from "@/lib/query-keys"
import { cn } from "@/lib/utils"

const HERO_PRODUCT_LIMIT = 3
const HERO_THUMBNAIL_QUERY = "(min-width: 640px)"

export function HomeHero() {
  const showThumbnails = useSyncExternalStore(
    subscribeToThumbnailViewport,
    getThumbnailViewportSnapshot,
    getThumbnailViewportServerSnapshot,
  )

  const { data, isPending } = useQuery({
    queryKey: queryKeys.products.list({ page: 1, limit: HERO_PRODUCT_LIMIT }),
    queryFn: () => getProducts({ page: 1, limit: HERO_PRODUCT_LIMIT }),
    enabled: showThumbnails,
  })

  const products = data?.data ?? []

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

      <div
        className="pointer-events-none absolute left-1/2 top-[17svh] z-0 flex w-max -translate-x-1/2 select-none items-center justify-center sm:top-[9svh] lg:top-[6svh]"
        aria-hidden
      >
        <span
          className={cn(
            "whitespace-nowrap font-display text-[38vw] font-bold uppercase leading-none text-neutral-950/[0.88] sm:text-[27vw] lg:text-[20vw]",
          )}
        >
          LUXIAN
        </span>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex h-full items-end justify-center">
        <div className="relative h-[94svh] min-h-[560px] w-[138vw] sm:h-[86svh] sm:min-h-[540px] sm:w-[min(112vw,900px)] lg:h-[88svh] lg:w-[min(74vw,1040px)]">
          <Image
            src="/hero-assets/hero-model2.png"
            alt="Model wearing Luxian streetwear"
            fill
            priority
            className="object-contain object-bottom drop-shadow-[0_28px_60px_rgba(32,28,20,0.28)]"
            sizes="(max-width: 768px) 112vw, 1040px"
          />
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] h-28 bg-[linear-gradient(180deg,transparent,oklch(0.78_0.045_84_/_0.72))] sm:h-36"
        aria-hidden
      />

      <div className="absolute bottom-5 left-4 z-20 max-w-[15rem] sm:bottom-10 sm:left-8 sm:max-w-sm lg:left-12">
        <Link
          href="/products"
          className="inline-flex h-11 items-center gap-2.5 rounded-md bg-white px-4 pr-5 text-sm font-medium text-neutral-950 transition-all hover:-translate-y-0.5 hover:brightness-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950/20"
        >
          <Image
            src="/luxian-logo.png"
            alt=""
            width={22}
            height={22}
            className="shrink-0 rounded-sm"
            aria-hidden
          />
          <span>Shop now</span>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-3.5 opacity-60"
            strokeWidth={2}
            aria-hidden
          />
        </Link>
        <p className="mt-3 hidden text-xs leading-relaxed text-neutral-950/70 min-[440px]:block sm:text-sm">
          Technical streetwear essentials with sculptural volume, clean utility, and everyday edge.
        </p>
      </div>

      {showThumbnails && (
        <div className="absolute bottom-10 right-4 z-20 grid grid-cols-2 grid-rows-2 gap-3 lg:bottom-14 lg:right-10">
          {isPending
            ? Array.from({ length: HERO_PRODUCT_LIMIT }).map((_, i) => (
                <Skeleton
                  key={i}
                  className={cn(
                    "size-16 rounded-md bg-white/70 lg:size-20",
                    i === 0 && "col-start-1 row-start-2",
                    i === 1 && "col-start-2 row-start-2",
                    i === 2 && "col-start-2 row-start-1",
                  )}
                />
              ))
            : products.slice(0, HERO_PRODUCT_LIMIT).map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className={cn(
                    "group relative size-16 overflow-hidden rounded-md transition-transform hover:-translate-y-1 lg:size-20",
                    index === 0 && "col-start-1 row-start-2",
                    index === 1 && "col-start-2 row-start-2",
                    index === 2 && "col-start-2 row-start-1",
                  )}
                  title={product.name}
                >
                  {product.imageUrl ? (
                    <StoreImage
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center rounded-md bg-white/70 p-1 text-center text-[9px] font-medium uppercase tracking-wide text-neutral-950/55">
                      {product.name.slice(0, 12)}
                    </div>
                  )}
                </Link>
              ))}
        </div>
      )}
    </section>
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
