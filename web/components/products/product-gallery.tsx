"use client"

import { ArrowLeft01Icon, ArrowLeftIcon, ArrowRight01Icon, FavouriteIcon, Share08Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useMemo, useState } from "react"
import { toast } from "sonner"

import { StoreImage } from "@/components/common/store-image"
import { Button } from "@/components/ui/button"
import type { Product, ProductImage } from "@/lib/types/product"
import { cn } from "@/lib/utils"

type ProductGalleryProps = {
  product: Product
}

type GalleryItem = {
  id: string
  url: string
  alt: string
}

function buildGalleryItems(product: Product): GalleryItem[] {
  const fromImages =
    product.images?.map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.altText?.trim() || product.name,
    })) ?? []

  if (fromImages.length > 0) {
    return fromImages
  }

  if (product.imageUrl) {
    return [{ id: "cover", url: product.imageUrl, alt: product.name }]
  }

  return []
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const items = useMemo(() => buildGalleryItems(product), [product])
  const defaultIndex = useMemo(() => {
    if (!items.length) {
      return 0
    }
    const coverIndex = items.findIndex((item) => item.url === product.imageUrl)
    return coverIndex >= 0 ? coverIndex : 0
  }, [items, product.imageUrl])

  const [activeIndex, setActiveIndex] = useState(defaultIndex)
  const active = items[activeIndex]
  const hasMultiple = items.length > 1

  const goTo = (index: number) => {
    if (!items.length) {
      return
    }
    const wrapped = (index + items.length) % items.length
    setActiveIndex(wrapped)
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden rounded-md border border-border/60 bg-muted">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="absolute top-3 left-3 z-10 border-white/70 bg-white/90 text-neutral-950 shadow-sm backdrop-blur hover:bg-white"
        >
          <Link href="/products" aria-label="Back to shop">
            <HugeiconsIcon icon={ArrowLeftIcon} className="size-4" strokeWidth={1.8} />
            Back
          </Link>
        </Button>

        {active ? (
          <StoreImage
            src={active.url}
            alt={active.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {product.category?.name ?? "Product"}
          </div>
        )}

        {hasMultiple && (
          <>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute top-1/2 left-3 z-10 size-10 -translate-y-1/2 rounded-full border-white/70 bg-white/90 shadow-sm backdrop-blur hover:bg-white"
              aria-label="Previous image"
              onClick={() => goTo(activeIndex - 1)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute top-1/2 right-3 z-10 size-10 -translate-y-1/2 rounded-full border-white/70 bg-white/90 shadow-sm backdrop-blur hover:bg-white"
              aria-label="Next image"
              onClick={() => goTo(activeIndex + 1)}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
            </Button>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                index === activeIndex ? "border-neutral-950" : "border-transparent ring-1 ring-border/60"
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
            >
              <StoreImage src={item.url} alt={item.alt} fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => toast.message("Favorites coming soon")}
        >
          <HugeiconsIcon icon={FavouriteIcon} className="size-4" strokeWidth={1.8} />
          Like
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => toast.message("Sharing coming soon")}
        >
          <HugeiconsIcon icon={Share08Icon} className="size-4" strokeWidth={1.8} />
          Share
        </Button>
      </div>
    </div>
  )
}
