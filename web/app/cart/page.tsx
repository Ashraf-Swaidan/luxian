import { CartView } from "@/components/cart/cart-view"
import { RequireAuth } from "@/components/auth/require-auth"
import { StorePage } from "@/components/layout/store-page"

export default function CartPage() {
  return (
    <RequireAuth>
      <StorePage title="Your bag" description="Review items and head to checkout when ready.">
        <CartView />
      </StorePage>
    </RequireAuth>
  )
}
