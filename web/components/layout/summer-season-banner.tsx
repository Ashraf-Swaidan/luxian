import Link from "next/link"

import { StoreImage } from "@/components/common/store-image"
import type { HomepageSettings } from "@/lib/types/homepage"

export function SummerSeasonBanner({ homepage }: { homepage: HomepageSettings }) {
  const imageUrl = homepage?.bannerImageUrl ?? "/hero-assets/banner.png"
  const href = homepage?.bannerCollectionId ? `/products?collectionId=${homepage.bannerCollectionId}` : "/products"
  const buttonText = homepage?.bannerButtonText || "See Collection"
  const ctaBg = homepage?.bannerCtaBackgroundColor
  const ctaText = homepage?.bannerCtaTextColor
  const customCta = Boolean(ctaBg || ctaText)

  return (
    <section className="bg-white px-4 pb-6 sm:px-10 sm:pb-8 lg:px-14 lg:pb-10">
      <div className="relative mx-auto aspect-[4/5] w-full max-w-[92rem] overflow-hidden bg-muted sm:aspect-[16/10]">
        <StoreImage
          src={imageUrl}
          alt="Summer season campaign"
          fill
          className="object-contain object-center sm:object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center sm:bottom-10">
          <Link
            href={href}
            className={
              customCta
                ? "inline-flex h-11 items-center justify-center px-7 text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-90"
                : "inline-flex h-11 items-center justify-center bg-white px-7 text-xs font-semibold tracking-wide text-neutral-950 uppercase transition-colors hover:bg-neutral-950 hover:text-white"
            }
            style={{
              ...(ctaBg ? { backgroundColor: ctaBg } : {}),
              ...(ctaText ? { color: ctaText } : {}),
            }}
          >
            {buttonText}
          </Link>
        </div>
      </div>
    </section>
  )
}
