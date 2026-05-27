import { CartView } from "@/components/cart-view"
import { RequireAuth } from "@/components/require-auth"
import { StorePage } from "@/components/store-page"

export default function CartPage() {
  return (
    <RequireAuth>
      <StorePage title="Your bag" description="Review items and head to checkout when ready.">
        <CartView />
      </StorePage>
    </RequireAuth>
  )
}
