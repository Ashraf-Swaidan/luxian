import { ProductsGrid } from "@/components/products-grid"

export default function ProductsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Shop</h1>
        <p className="text-sm text-muted-foreground">
          Browse our catalog. Sign in to add items to your cart.
        </p>
      </div>
      <ProductsGrid />
    </main>
  )
}
