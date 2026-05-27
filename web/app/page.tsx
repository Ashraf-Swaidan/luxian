import Link from "next/link"

import { ProductsGrid } from "@/components/products-grid"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl flex-col gap-12 px-6 py-10">
      <section className="flex max-w-xl flex-col gap-4">
        <h1 className="text-3xl font-medium tracking-tight">Luxian</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Curated essentials for modern living. Explore the collection or sign in to
          checkout when you are ready.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/products">Shop all</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </section>

      <ProductsGrid title="Featured" limit={3} />
    </main>
  )
}
