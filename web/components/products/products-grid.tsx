"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useQuery } from "@tanstack/react-query"

import { EmptyState } from "@/components/common/empty-state"
import { StoreImage } from "@/components/common/store-image"
import { Skeleton } from "@/components/ui/skeleton"
import { getHomepageSettings } from "@/features/homepage/api"
import { getProducts } from "@/features/products/api"
import { getErrorMessage, toastApiError } from "@/lib/error-message"
import { queryKeys } from "@/lib/query-keys"

type ProductsGridProps = {
  title?: string
  limit?: number
}

const DEFAULT_COLLECTION_DESCRIPTION =
  "Shop our latest Luxian collection, featuring technical silhouettes, sharp utility, and standout everyday pieces."

export function ProductsGrid({ limit = 3, title = "LATEST COLLECTION" }: ProductsGridProps) {
  const params = { page: 1, limit }

  const { data: homepage } = useQuery({
    queryKey: queryKeys.homepage,
    queryFn: getHomepageSettings,
  })
  const { data, isPending, isError, error } = useQuery({
    queryKey: queryKeys.products.list(params),
    queryFn: () => getProducts(params),
  })

  useEffect(() => {
    if (isError) {
      toastApiError(error, "Failed to load products")
    }
  }, [isError, error])

  if (isPending) {
    return (
      <CollectionSection description={DEFAULT_COLLECTION_DESCRIPTION} title={title}>
        <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {Array.from({ length: limit }).map((_, i) => (
            <Skeleton
              key={i}
              className="aspect-[4/5] w-[72vw] shrink-0 sm:w-[46vw] md:w-full"
            />
          ))}
        </div>
      </CollectionSection>
    )
  }

  if (isError) {
    return (
      <CollectionSection description={DEFAULT_COLLECTION_DESCRIPTION} title={title}>
        <p className="text-sm text-destructive">
          {getErrorMessage(error, "Failed to load products")}
        </p>
      </CollectionSection>
    )
  }

  const latestCollection = homepage?.latestCollection
  const collectionProducts =
    latestCollection?.collectionProducts?.map((item) => item.product).slice(0, 3) ?? []
  const products = collectionProducts.length ? collectionProducts : (data?.data ?? [])
  const sectionTitle = latestCollection?.name.toUpperCase() ?? title
  const description =
    latestCollection?.description ?? DEFAULT_COLLECTION_DESCRIPTION

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
      <div className="-mx-6 flex gap-4 overflow-x-auto px-6 pb-2 sm:-mx-10 sm:px-10 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
        {products.slice(0, 3).map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group relative block aspect-[4/5] w-[72vw] shrink-0 overflow-hidden bg-muted sm:w-[46vw] md:w-full"
          >
            {product.imageUrl ? (
              <StoreImage
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted p-6 text-center text-sm font-medium uppercase tracking-wider text-muted-foreground">
                {product.name}
              </div>
            )}
            <span className="absolute bottom-6 left-6 inline-flex h-9 items-center justify-center bg-white px-5 text-xs font-semibold text-neutral-950">
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
      <h2 className="font-display text-5xl font-bold uppercase leading-none text-[oklch(0.32_0.09_178)] sm:text-6xl lg:text-7xl">
        {title}
      </h2>
      <p className="max-w-xl text-sm leading-relaxed text-neutral-600 sm:text-base">
        {description}
      </p>
    </header>
  )
}
