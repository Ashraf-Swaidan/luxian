import { CheckoutForm } from "@/components/orders/checkout-form"
import { RequireAuth } from "@/components/auth/require-auth"

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Almost yours
          </p>
          <h1 className="font-display text-5xl font-bold uppercase leading-none text-neutral-950">
            Checkout
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Review your pieces, add a delivery note, and place the order when it looks right.
          </p>
        </div>
        <CheckoutForm />
      </main>
    </RequireAuth>
  )
}
