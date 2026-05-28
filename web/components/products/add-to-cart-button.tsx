"use client"

import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { useAddToCart } from "@/features/cart/hooks"
import { toastApiError } from "@/lib/error-message"
import { useAuth } from "@/providers/auth-provider"
import { cn } from "@/lib/utils"

type AddToCartButtonProps = {
  productId: string
  disabled?: boolean
  className?: string
}

export function AddToCartButton({ productId, disabled, className }: AddToCartButtonProps) {
  const { user } = useAuth()
  const addToCart = useAddToCart()

  if (!user) {
    return (
      <Button asChild disabled={disabled} className={cn("w-full sm:w-auto", className)}>
        <Link href={`/login?redirect=/products/${productId}`}>Sign in to add to cart</Link>
      </Button>
    )
  }

  return (
    <Button
      className={cn("luxian-cta w-full sm:w-auto", className)}
      disabled={disabled}
      onClick={() => {
        addToCart.mutate(
          { productId },
          {
            onSuccess: () => toast.success("Added to bag"),
            onError: (error) => toastApiError(error, "Could not add to cart"),
          },
        )
      }}
    >
      Add to bag
    </Button>
  )
}
