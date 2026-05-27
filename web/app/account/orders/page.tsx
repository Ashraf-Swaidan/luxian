import { OrdersList } from "@/components/orders-list"
import { RequireAuth } from "@/components/require-auth"

export default function AccountOrdersPage() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Your orders</h1>
          <p className="text-sm text-muted-foreground">
            History of everything you have purchased.
          </p>
        </div>
        <OrdersList />
      </main>
    </RequireAuth>
  )
}
