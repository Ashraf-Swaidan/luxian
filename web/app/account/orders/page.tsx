import { OrdersList } from "@/components/orders/orders-list"
import { RequireAuth } from "@/components/auth/require-auth"

export default function AccountOrdersPage() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Account
          </p>
          <h1 className="font-display text-5xl font-bold uppercase leading-none text-neutral-950">
            Your orders
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Track purchases, revisit previous pieces, and sort your Luxian history.
          </p>
        </div>
        <OrdersList />
      </main>
    </RequireAuth>
  )
}
