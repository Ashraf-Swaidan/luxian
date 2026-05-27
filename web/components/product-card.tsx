import Image from "next/image"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/format-price"
import type { Product } from "@/lib/types/product"

type ProductCardProps = {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const outOfStock = product.stock < 1

  return (
    <Link href={`/products/${product.id}`} className="group block h-full">
      <Card size="sm" className="h-full transition-shadow group-hover:ring-foreground/20">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {product.imageUrl ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              {product.category?.name ?? "Product"}
            </div>
          )}
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="line-clamp-1">{product.name}</CardTitle>
          <CardDescription className="line-clamp-1">
            {product.category?.name ?? "Uncategorized"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between pt-0">
          <span className="font-medium">{formatPrice(product.price)}</span>
          <span className="text-xs text-muted-foreground">
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}
