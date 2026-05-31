import Image from "next/image"
import Link from "next/link"

type AuthShowcaseLayoutProps = {
  children: React.ReactNode
  eyebrow: string
  imageAlt: string
  imageSrc: string
  reverse?: boolean
  title: string
  body: string
}

const benefits = ["Fast checkout", "Order tracking", "Saved bag"]

export function AuthShowcaseLayout({
  body,
  children,
  eyebrow,
  imageAlt,
  imageSrc,
  reverse,
  title,
}: AuthShowcaseLayoutProps) {
  return (
    <main className="min-h-[calc(100svh-3.5rem)] bg-[#f6f2e8]">
      <div
        className={
          reverse
            ? "grid min-h-[calc(100svh-3.5rem)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
            : "grid min-h-[calc(100svh-3.5rem)] lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]"
        }
      >
        <section
          className={
            reverse
              ? "relative min-h-[18rem] overflow-hidden lg:order-2 lg:min-h-full"
              : "relative min-h-[18rem] overflow-hidden lg:min-h-full"
          }
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/35 to-transparent" />
          <div className="absolute bottom-5 left-5 text-xs font-medium tracking-wide text-white uppercase sm:bottom-8 sm:left-8">
            Luxian
          </div>
        </section>

        <section className="flex items-center px-6 py-10 sm:px-10 lg:px-14 lg:py-16">
          <div className="mx-auto w-full max-w-md">
            <Link
              href="/"
              className="inline-flex items-center font-display text-2xl font-black tracking-normal text-neutral-950 uppercase"
            >
              Luxian
            </Link>

            <div className="mt-10 border-t border-neutral-950/15 pt-8">
              <p className="text-xs font-medium tracking-wide text-neutral-500 uppercase">{eyebrow}</p>
              <h1 className="mt-3 font-display text-5xl leading-[0.9] font-black text-neutral-950 uppercase sm:text-6xl">
                {title}
              </h1>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-neutral-600">{body}</p>
            </div>

            <div className="mt-8">{children}</div>

            <div className="mt-8 grid grid-cols-3 border-y border-neutral-950/10 text-center">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="border-r border-neutral-950/10 px-2 py-3 text-[10px] font-medium tracking-wide text-neutral-600 uppercase last:border-r-0"
                >
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
