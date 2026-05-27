import type { Cart } from "@/lib/types/cart"
import { formatPrice } from "@/lib/format-price"

export function getCartSubtotal(cart: Cart | undefined) {
  if (!cart?.cartItems.length) {
    return 0
  }

  return cart.cartItems.reduce((sum, item) => {
    if (!item.product) {
      return sum
    }
    const unit = Number.parseFloat(item.product.price)
    if (Number.isNaN(unit)) {
      return sum
    }
    return sum + unit * item.quantity
  }, 0)
}

export function formatCartSubtotal(cart: Cart | undefined) {
  return formatPrice(getCartSubtotal(cart))
}
