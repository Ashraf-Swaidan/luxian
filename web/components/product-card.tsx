import Image from "next/image"
import Link from "next/link"

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
      <article className="overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
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
            <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              Sold out
            </span>
          )}
        </div>
        <div className="space-y-1 p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {product.category?.name ?? "Collection"}
          </p>
          <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-[var(--luxian-teal)]">
            {product.name}
          </h3>
          <p className={cn("pt-1 text-sm font-medium tabular-nums", outOfStock && "text-muted-foreground")}>
            {formatPrice(product.price)}
          </p>
        </div>
      </article>
    </Link>
  )
}
