"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { StoreImage } from "@/components/common/store-image"
import { Skeleton } from "@/components/ui/skeleton"
import { getHomepageSettings } from "@/features/homepage/api"
import { queryKeys } from "@/lib/query-keys"
import type { Collection } from "@/lib/types/collection"

export function CollectionPairSection() {
  const { data: homepage, isPending } = useQuery({
    queryKey: queryKeys.homepage,
    queryFn: getHomepageSettings,
  })

  if (isPending) {
    return (
      <section className="relative overflow-hidden bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
        <GradientWash />
        <div className="relative mx-auto grid w-full max-w-[92rem] gap-6 md:grid-cols-2">
          <Skeleton className="aspect-[5/4] rounded-none" />
          <Skeleton className="aspect-[5/4] rounded-none" />
        </div>
      </section>
    )
  }

  const collections = [homepage?.pairLeftCollection, homepage?.pairRightCollection].filter(
    Boolean
  ) as Collection[]

  if (!collections.length) {
    return null
  }

  return (
    <section className="relative overflow-hidden bg-white px-6 py-16 sm:px-10 sm:py-20 lg:px-14">
      <GradientWash />
      <div className="relative mx-auto grid w-full max-w-[92rem] gap-6 md:grid-cols-2">
        {collections.map((collection) => (
          <CollectionPairCard key={collection.id} collection={collection} />
        ))}
      </div>
    </section>
  )
}

function CollectionPairCard({ collection }: { collection: Collection }) {
  const imageUrl = collection.imageUrl ?? collection.collectionProducts?.find((item) => item.product.imageUrl)?.product.imageUrl

  return (
    <Link href={`/products?collectionId=${collection.id}`} className="group block">
      <article className="space-y-5">
        <h2 className="font-display text-4xl leading-none font-bold text-neutral-950 uppercase sm:text-5xl lg:text-6xl">
          {collection.name}
        </h2>
        <div className="relative aspect-[5/4] overflow-hidden bg-neutral-100">
          {imageUrl ? (
            <StoreImage
              src={imageUrl}
              alt={collection.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
              sizes="(max-width: 768px) 100vw, 46vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm font-medium tracking-wide text-muted-foreground uppercase">
              {collection.name}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}

function GradientWash() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-1/2 h-2/3 -translate-y-1/2 bg-[linear-gradient(90deg,transparent,oklch(0.9_0.07_178_/_0.35),oklch(0.93_0.08_80_/_0.28),transparent)] blur-3xl"
    />
  )
}
