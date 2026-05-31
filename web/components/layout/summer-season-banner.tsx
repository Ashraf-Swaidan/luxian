"use client"

import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { StoreImage } from "@/components/common/store-image"
import { getHomepageSettings } from "@/features/homepage/api"
import { queryKeys } from "@/lib/query-keys"

export function SummerSeasonBanner() {
  const { data: homepage } = useQuery({
    queryKey: queryKeys.homepage,
    queryFn: getHomepageSettings,
  })
  const imageUrl = homepage?.bannerImageUrl ?? "/hero-assets/banner.png"
  const href = homepage?.bannerCollectionId
    ? `/products?collectionId=${homepage.bannerCollectionId}`
    : "/products"
  const buttonText = homepage?.bannerButtonText || "See Collection"

  return (
    <section className="bg-white px-6 pb-6 sm:px-10 sm:pb-8 lg:px-14 lg:pb-10">
      <div className="relative mx-auto h-[88svh] min-h-[660px] w-full max-w-[92rem] overflow-hidden bg-muted sm:aspect-[16/10] sm:h-auto sm:min-h-0">
        <StoreImage
          src={imageUrl}
          alt="Summer season campaign"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center sm:bottom-10">
          <Link
            href={href}
            className="inline-flex h-11 items-center justify-center bg-white px-7 text-xs font-semibold uppercase tracking-wide text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white"
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  )
}
