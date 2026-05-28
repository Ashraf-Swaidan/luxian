import { OrderDetailView } from "@/components/orders/order-detail-view"
import { RequireAuth } from "@/components/auth/require-auth"

export default function OrderDetailPage() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <OrderDetailView />
      </main>
    </RequireAuth>
  )
}
