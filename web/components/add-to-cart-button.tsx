"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAddToCart } from "@/features/cart/hooks"
import { ApiError } from "@/lib/api-client"
import { useAuth } from "@/providers/auth-provider"

type AddToCartButtonProps = {
  productId: string
  disabled?: boolean
}

export function AddToCartButton({ productId, disabled }: AddToCartButtonProps) {
  const { user } = useAuth()
  const router = useRouter()
  const addToCart = useAddToCart()

  if (!user) {
    return (
      <Button asChild disabled={disabled}>
        <Link href={`/login?redirect=/products/${productId}`}>Sign in to add to cart</Link>
      </Button>
    )
  }

  return (
    <Button
      disabled={disabled || addToCart.isPending}
      onClick={() => {
        addToCart.mutate({ productId }, {
          onSuccess: () => {
            toast.success("Added to cart")
            router.push("/cart")
          },
          onError: (error) => {
            const message =
              error instanceof ApiError
                ? error.messages.join(", ")
                : error instanceof Error
                  ? error.message
                  : "Could not add to cart"
            toast.error(message)
          },
        })
      }}
    >
      {addToCart.isPending ? "Adding…" : "Add to cart"}
    </Button>
  )
}
