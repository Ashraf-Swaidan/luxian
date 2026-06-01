"use client"

import { ProductCard } from "@/components/products/product-card"
import type { Product } from "@/lib/types/product"

type ProductRecommendationSectionProps = {
  title: string
  description?: string
  products: Product[]
  minItems: number
}

export function ProductRecommendationSection({
  description,
  minItems,
  products,
  title,
}: ProductRecommendationSectionProps) {
  if (products.length < minItems) {
    return null
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-display text-4xl leading-none font-bold text-neutral-950 uppercase">{title}</h2>
        {description ? <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      <div className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="w-[76vw] shrink-0 snap-start sm:w-[42vw] md:w-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  )
}
