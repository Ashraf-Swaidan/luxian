"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  FavouriteIcon,
  Share08Icon,
  ZoomInAreaIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { toast } from "sonner"

import { StoreImage } from "@/components/common/store-image"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils"

type ProductGalleryProps = {
  product: Product
}

type GalleryItem = {
  id: string
  url: string
  alt: string
}

const overlayButtonClass =
  "size-9 rounded-md border border-white/70 bg-white/90 text-neutral-950 shadow-sm backdrop-blur hover:bg-white"

const MIN_ZOOM = 1
const DEFAULT_ZOOM = 2.5

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
  const [zoomMode, setZoomMode] = useState(false)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [origin, setOrigin] = useState({ x: 50, y: 50 })

  const containerRef = useRef<HTMLDivElement>(null)

  const active = items[activeIndex]
  const hasMultiple = items.length > 1
  const isZoomed = zoom > MIN_ZOOM

  const resetZoomView = useCallback(() => {
    setZoom(MIN_ZOOM)
    setPan({ x: 0, y: 0 })
    setOrigin({ x: 50, y: 50 })
  }, [])

  const exitZoomMode = useCallback(() => {
    setZoomMode(false)
    resetZoomView()
  }, [resetZoomView])

  const goTo = (index: number) => {
    if (!items.length) {
      return
    }
    const wrapped = (index + items.length) % items.length
    setActiveIndex(wrapped)
    exitZoomMode()
  }

  useEffect(() => {
    exitZoomMode()
  }, [activeIndex, exitZoomMode])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && zoomMode) {
        exitZoomMode()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [zoomMode, exitZoomMode])

  const toggleZoomMode = () => {
    if (zoomMode) {
      exitZoomMode()
      return
    }
    setZoomMode(true)
    resetZoomView()
  }

  const handleImageClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomMode) {
      return
    }
    const target = event.target as HTMLElement
    if (target.closest("button")) {
      return
    }

    if (isZoomed) {
      resetZoomView()
      return
    }

    const el = containerRef.current
    if (!el) {
      return
    }
    const rect = el.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setOrigin({ x, y })
    setPan({ x: 0, y: 0 })
    setZoom(DEFAULT_ZOOM)
  }

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className={cn(
          "relative aspect-4/5 overflow-hidden rounded-lg bg-muted select-none",
          zoomMode && !isZoomed && "cursor-zoom-in",
          zoomMode && isZoomed && "cursor-zoom-out"
        )}
        onClick={handleImageClick}
        role={active ? "img" : undefined}
        aria-label={
          active
            ? zoomMode
              ? isZoomed
                ? `${active.alt}. Click to zoom out.`
                : `${active.alt}. Click to zoom in.`
              : active.alt
            : undefined
        }
      >
        {active ? (
          <div
            className="absolute inset-0 will-change-transform"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          >
            <StoreImage
              src={active.url}
              alt={active.alt}
              fill
              className="pointer-events-none object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              draggable={false}
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {product.category?.name ?? "Product"}
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="pointer-events-auto absolute top-3 right-3 z-20 flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={overlayButtonClass}
              aria-label="Share product"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                toast.message("Sharing coming soon")
              }}
            >
              <HugeiconsIcon icon={Share08Icon} className="size-4" strokeWidth={1.8} />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={overlayButtonClass}
              aria-label="Add to favorites"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                toast.message("Favorites coming soon")
              }}
            >
              <HugeiconsIcon icon={FavouriteIcon} className="size-4" strokeWidth={1.8} />
            </Button>
          </div>

          {active && (
            <div className="pointer-events-auto absolute bottom-3 left-3 z-20">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  overlayButtonClass,
                  zoomMode && "border-[var(--luxian-teal)] bg-[var(--luxian-teal)]/10 ring-1 ring-[var(--luxian-teal)]/40"
                )}
                aria-label={zoomMode ? "Exit zoom mode" : "Enter zoom mode"}
                aria-pressed={zoomMode}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleZoomMode()
                }}
              >
                <HugeiconsIcon icon={ZoomInAreaIcon} className="size-4" strokeWidth={1.8} />
              </Button>
            </div>
          )}

          {hasMultiple && (
            <div className="pointer-events-auto absolute right-3 bottom-3 z-20 flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={overlayButtonClass}
                aria-label="Previous image"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  goTo(activeIndex - 1)
                }}
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={overlayButtonClass}
                aria-label="Next image"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  goTo(activeIndex + 1)
                }}
              >
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
              </Button>
            </div>
          )}
        </div>

        {zoomMode && (
          <p className="pointer-events-none absolute bottom-3 left-14 z-10 rounded-md bg-black/50 px-2 py-1 text-[10px] text-white">
            {isZoomed ? "Click to zoom out" : "Click image to zoom in"}
          </p>
        )}
      </div>

      {hasMultiple && (
        <div className="flex gap-2.5">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={cn(
                "relative aspect-4/5 w-24 shrink-0 overflow-hidden rounded-md transition-opacity",
                index === activeIndex ? "opacity-40" : "opacity-100 hover:opacity-90"
              )}
              aria-label={`View image ${index + 1}`}
              aria-current={index === activeIndex}
            >
              <StoreImage src={item.url} alt={item.alt} fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
