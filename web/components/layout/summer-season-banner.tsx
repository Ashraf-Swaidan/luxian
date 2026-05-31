import Image from "next/image"
import Link from "next/link"

export function SummerSeasonBanner() {
  return (
    <section className="bg-white px-6 pb-6 sm:px-10 sm:pb-8 lg:px-14 lg:pb-10">
      <div className="relative mx-auto h-[88svh] min-h-[660px] w-full max-w-[92rem] overflow-hidden bg-muted sm:aspect-[16/10] sm:h-auto sm:min-h-0">
        <Image
          src="/hero-assets/banner.png"
          alt="Summer season campaign"
          fill
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-x-0 bottom-8 z-10 flex justify-center sm:bottom-10">
          <Link
            href="/products"
            className="inline-flex h-11 items-center justify-center bg-white px-7 text-xs font-semibold uppercase tracking-wide text-neutral-950 transition-colors hover:bg-neutral-950 hover:text-white"
          >
            See Collection
          </Link>
        </div>
      </div>
    </section>
  )
}
