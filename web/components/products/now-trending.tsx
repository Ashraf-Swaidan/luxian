import Link from "next/link"

import { StoreImage } from "@/components/common/store-image"
import type { Product } from "@/lib/types/product"

const TRENDING_LIMIT = 12

export function NowTrending({ products }: { products: Product[] }) {
  return (
    <section className="bg-white px-6 py-20 sm:px-10 sm:py-24 lg:px-14 lg:py-28">
      <div className="mx-auto w-full max-w-[112rem]">
        <h2 className="mb-12 text-3xl font-medium tracking-tight text-neutral-950">Now trending</h2>

        {products.length > 0 && (
          <div className="grid gap-x-12 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.slice(0, TRENDING_LIMIT).map((product) => (
              <TrendingItem key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function TrendingItem({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="grid min-h-24 grid-cols-[6.5rem_minmax(0,1fr)] items-center gap-5"
    >
      <div className="relative h-24 w-full overflow-hidden bg-white">
        {product.imageUrl ? (
          <StoreImage src={product.imageUrl} alt={product.name} fill className="object-contain" sizes="112px" />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted text-xs font-medium tracking-wider text-muted-foreground uppercase">
            Luxian
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-base leading-snug font-medium text-neutral-950">{product.name}</p>
        <p className="mt-1 truncate text-sm text-neutral-500">{product.category?.name ?? "Luxian"}</p>
      </div>
    </Link>
  )
}
