import Link from "next/link"

import { RequireAuth } from "@/components/require-auth"
import { Button } from "@/components/ui/button"

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-medium">Checkout</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Place order flow comes in Phase E.
        </p>
        <Button className="mt-4" variant="outline" asChild>
          <Link href="/cart">Back to cart</Link>
        </Button>
      </main>
    </RequireAuth>
  )
}
