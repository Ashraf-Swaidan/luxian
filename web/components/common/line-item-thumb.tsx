import Link from "next/link"

import { StoreImage } from "@/components/common/store-image"
import { cn } from "@/lib/utils"

type LineItemThumbProps = {
  productId?: string
  name: string
  imageUrl?: string | null
  size?: "xs" | "sm" | "md"
  className?: string
}

const sizes = {
  xs: "size-8 rounded-md",
  sm: "size-12 rounded-md",
  md: "size-20 rounded-md",
}

const imageSizes = {
  xs: "32px",
  sm: "48px",
  md: "80px",
}

export function LineItemThumb({
  productId,
  name,
  imageUrl,
  size = "md",
  className,
}: LineItemThumbProps) {
  const boxClass = cn("relative shrink-0 overflow-hidden bg-muted", sizes[size], className)

  const image = imageUrl ? (
    <StoreImage
      src={imageUrl}
      alt={name}
      fill
      className="object-cover"
      sizes={imageSizes[size]}
    />
  ) : (
    <div className="flex h-full items-center justify-center px-1 text-center text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
      Luxian
    </div>
  )

  if (productId) {
    return (
      <Link
        href={`/products/${productId}`}
        className={cn(boxClass, "ring-1 ring-border/60 transition-opacity hover:opacity-90")}
      >
        {image}
      </Link>
    )
  }

  return <div className={cn(boxClass, "ring-1 ring-border/60")}>{image}</div>
}
