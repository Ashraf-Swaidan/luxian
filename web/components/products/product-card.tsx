import Link from "next/link"

import { StoreImage } from "@/components/common/store-image"
import { formatPrice } from "@/lib/format-price"
import type { Product } from "@/lib/types/product"
import { cn } from "@/lib/utils"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock < 1

  return (
    <Link href={`/products/${product.id}`} className="group block">
      <article className="overflow-hidden rounded-md bg-card">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          {product.imageUrl ? (
            <StoreImage
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {product.category?.name ?? "Luxian"}
              </span>
            </div>
          )}
          {outOfStock && (
            <span className="absolute left-2 top-2 rounded-sm bg-background/90 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide sm:left-3 sm:top-3 sm:px-2.5 sm:text-[10px]">
              Sold out
            </span>
          )}
        </div>
        <div className="space-y-0.5 p-2.5 sm:space-y-1 sm:p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-[11px]">
            {product.category?.name ?? "Collection"}
          </p>
          <h3 className="line-clamp-2 text-xs font-medium leading-snug group-hover:text-[var(--luxian-teal)] sm:text-sm">
            {product.name}
          </h3>
          <p className={cn("pt-0.5 text-xs font-medium tabular-nums sm:pt-1 sm:text-sm", outOfStock && "text-muted-foreground")}>
            {formatPrice(product.price)}
          </p>
        </div>
      </article>
    </Link>
  )
}
