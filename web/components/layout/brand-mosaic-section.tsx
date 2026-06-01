import Link from "next/link"

import { StoreImage } from "@/components/common/store-image"
import type { HomepageSettings } from "@/lib/types/homepage"
import { cn } from "@/lib/utils"

import styles from "./brand-mosaic-section.module.css"

type BrandMosaicItem = {
  alt: string
  areaClassName: string
  homepageKey:
    | "brandImage1Url"
    | "brandImage2Url"
    | "brandImage3Url"
    | "brandImage4Url"
    | "brandImage5Url"
    | "brandImage6Url"
  label: string
  src: string
}

const brandMosaicItems: BrandMosaicItem[] = [
  {
    src: "/brand-assets/image-1.png",
    homepageKey: "brandImage1Url",
    alt: "Luxian collective campaign",
    label: "The Collective",
    areaClassName: styles.collective,
  },
  {
    src: "/brand-assets/image-2.png",
    homepageKey: "brandImage2Url",
    alt: "Luxian destination campaign",
    label: "Destination",
    areaClassName: styles.destination,
  },
  {
    src: "/brand-assets/image-3.png",
    homepageKey: "brandImage3Url",
    alt: "Luxian signature shirt campaign",
    label: "Signature Shirt",
    areaClassName: styles.shirt,
  },
  {
    src: "/brand-assets/image-4.png",
    homepageKey: "brandImage4Url",
    alt: "Luxian resort elegance campaign",
    label: "Resort Elegance",
    areaClassName: styles.elegance,
  },
  {
    src: "/brand-assets/image-5.png",
    homepageKey: "brandImage5Url",
    alt: "Luxian sunset club campaign",
    label: "Sunset Club",
    areaClassName: styles.sunset,
  },
  {
    src: "/brand-assets/image-6.png",
    homepageKey: "brandImage6Url",
    alt: "Luxian accessories campaign",
    label: "Accessories",
    areaClassName: styles.accessories,
  },
]

export function BrandMosaicSection({ homepage }: { homepage: HomepageSettings }) {
  return (
    <section className="bg-neutral-950 px-4 py-16 text-white sm:px-6 sm:py-20 lg:px-10 lg:py-24">
      <div className="mx-auto w-full max-w-[112rem]">
        <div className="mb-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="text-xs font-medium tracking-wide text-white/50 uppercase">Luxian visual world</p>
            <h2 className="mt-3 max-w-4xl font-display text-5xl leading-[0.9] font-black uppercase sm:text-6xl lg:text-7xl">
              Built for the whole destination
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex h-11 w-fit items-center bg-white px-5 text-sm font-semibold text-neutral-950 transition-transform hover:scale-[1.02]"
          >
            Shop Luxian
          </Link>
        </div>

        <BrandMosaicImages homepage={homepage} />
      </div>
    </section>
  )
}

function BrandMosaicImages({ homepage }: { homepage: HomepageSettings }) {
  return (
    <div className={styles.mosaicGrid}>
      {brandMosaicItems.map((item, index) => (
        <figure key={item.src} className={cn("group", styles.mosaicItem, item.areaClassName)}>
          <StoreImage
            src={homepage?.[item.homepageKey] ?? item.src}
            alt={item.alt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
            sizes={
              index === 0
                ? "(max-width: 1024px) 100vw, 58vw"
                : "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 34vw"
            }
          />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/55 to-transparent" />
          <figcaption className="absolute bottom-4 left-4 text-xs font-medium tracking-wide text-white uppercase">
            {String(index + 1).padStart(2, "0")} / {item.label}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
