import { CheckoutForm } from "@/components/orders/checkout-form"
import { RequireAuth } from "@/components/auth/require-auth"

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-2xl font-medium tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Review your order and place it with stub payment.
          </p>
        </div>
        <CheckoutForm />
      </main>
    </RequireAuth>
  )
}
