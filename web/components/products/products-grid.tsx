import Link from "next/link"

import { EmptyState } from "@/components/common/empty-state"
import { StoreImage } from "@/components/common/store-image"
import type { Collection } from "@/lib/types/collection"
import type { Product } from "@/lib/types/product"

type ProductsGridProps = {
  latestCollection: Collection | null
  products: Product[]
  title?: string
  limit?: number
}

const DEFAULT_COLLECTION_DESCRIPTION =
  "Shop our latest Luxian collection, featuring technical silhouettes, sharp utility, and standout everyday pieces."

export function ProductsGrid({
  latestCollection,
  limit = 3,
  products,
  title = "LATEST COLLECTION",
}: ProductsGridProps) {
  const sectionTitle = latestCollection?.name.toUpperCase() ?? title
  const description = latestCollection?.description ?? DEFAULT_COLLECTION_DESCRIPTION

  if (!products.length) {
    return (
      <CollectionSection description={description} title={sectionTitle}>
        <EmptyState
          title="No products yet"
          description="Check back soon, or sign in as admin to add catalog items."
          actionLabel="Browse shop"
          actionHref="/products"
        />
      </CollectionSection>
    )
  }

  return (
    <CollectionSection description={description} title={sectionTitle}>
      <div className="-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
        {products.slice(0, limit).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group relative block aspect-[4/5] w-[76vw] shrink-0 snap-start overflow-hidden bg-muted sm:w-[42vw] md:w-full"
          >
            {product.imageUrl ? (
              <StoreImage
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted p-6 text-center text-sm font-medium tracking-wider text-muted-foreground uppercase">
                {product.name}
              </div>
            )}
            <span className="absolute bottom-3 left-3 inline-flex h-7 items-center justify-center bg-white px-3 text-[10px] font-semibold text-neutral-950 sm:bottom-6 sm:left-6 sm:h-9 sm:px-5 sm:text-xs">
              Show More
            </span>
          </Link>
        ))}
      </div>
    </CollectionSection>
  )
}

function CollectionSection({
  children,
  description,
  title,
}: {
  children: React.ReactNode
  description: string
  title: string
}) {
  return (
    <section className="bg-white px-6 py-20 sm:px-10 sm:py-24 lg:px-14 lg:py-28">
      <div className="mx-auto w-full max-w-[92rem] space-y-10">
        <CollectionHeader description={description} title={title} />
        {children}
      </div>
    </section>
  )
}

function CollectionHeader({ description, title }: { description: string; title: string }) {
  return (
    <header className="max-w-2xl space-y-4">
      <h2 className="font-display text-5xl leading-none font-bold text-[oklch(0.32_0.09_178)] uppercase sm:text-6xl lg:text-7xl">
        {title}
      </h2>
      <p className="max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">{description}</p>
    </header>
  )
}
