import { CartView } from "@/components/cart-view"
import { RequireAuth } from "@/components/require-auth"

export default function CartPage() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Cart</h1>
          <p className="text-sm text-muted-foreground">
            Review your items before checkout.
          </p>
        </div>
        <CartView />
      </main>
    </RequireAuth>
  )
}
