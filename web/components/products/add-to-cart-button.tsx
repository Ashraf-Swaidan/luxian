"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAddToCart } from "@/features/cart/hooks"
import { toastApiError } from "@/lib/error-message"
import { loginSchema, registerSchema, type LoginFormValues, type RegisterFormValues } from "@/lib/validations/auth"
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
  const [authOpen, setAuthOpen] = useState(false)

  const addProductToCart = () => {
    addToCart.mutate(
      { productId },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: (error) => toastApiError(error, "Could not add to cart"),
      }
    )
  }

  if (!user) {
    return (
      <>
        <Button
          className={cn("luxian-cta h-12 w-full px-7 text-base sm:h-10 sm:w-auto sm:text-sm", className)}
          disabled={disabled}
          onClick={() => setAuthOpen(true)}
        >
          Add to cart
        </Button>
        <CartAuthDialog
          open={authOpen}
          productId={productId}
          onAdded={() => setAuthOpen(false)}
          onOpenChange={setAuthOpen}
        />
      </>
    )
  }

  return (
    <Button
      className={cn("luxian-cta h-12 w-full px-7 text-base sm:h-10 sm:w-auto sm:text-sm", className)}
      disabled={disabled || addToCart.isPending}
      onClick={addProductToCart}
    >
      {addToCart.isPending ? "Adding..." : "Add to cart"}
    </Button>
  )
}

function CartAuthDialog({
  onAdded,
  onOpenChange,
  open,
  productId,
}: {
  onAdded: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  productId: string
}) {
  const { login, register: registerUser } = useAuth()
  const addToCart = useAddToCart()
  const [mode, setMode] = useState<"register" | "login">("register")

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const addPendingProduct = async () => {
    await addToCart.mutateAsync({ productId })
    toast.success("Added to cart")
    onAdded()
  }

  const onRegisterSubmit = registerForm.handleSubmit(async (values) => {
    try {
      await registerUser(values)
      toast.success("Account created")
      await addPendingProduct()
    } catch (error) {
      toastApiError(error)
    }
  })

  const onLoginSubmit = loginForm.handleSubmit(async (values) => {
    try {
      await login(values)
      toast.success("Welcome back")
      await addPendingProduct()
    } catch (error) {
      toastApiError(error)
    }
  })

  const isSubmitting = registerForm.formState.isSubmitting || loginForm.formState.isSubmitting || addToCart.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-y-auto p-6 sm:p-8">
        <DialogHeader>
          <DialogTitle>{mode === "register" ? "Create account" : "Welcome back"}</DialogTitle>
          <DialogDescription>
            {mode === "register"
              ? "Create an account and we will add this item to your cart."
              : "Log in and we will add this item to your cart."}
          </DialogDescription>
        </DialogHeader>

        {mode === "register" ? (
          <form onSubmit={onRegisterSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cart-register-email" className="text-xs uppercase">
                Email
              </Label>
              <Input
                id="cart-register-email"
                type="email"
                autoComplete="email"
                className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
                {...registerForm.register("email")}
              />
              {registerForm.formState.errors.email && (
                <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cart-register-password" className="text-xs uppercase">
                Password
              </Label>
              <Input
                id="cart-register-password"
                type="password"
                autoComplete="new-password"
                className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
                {...registerForm.register("password")}
              />
              {registerForm.formState.errors.password && (
                <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cart-register-first-name" className="text-xs uppercase">
                  First name
                </Label>
                <Input
                  id="cart-register-first-name"
                  className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
                  {...registerForm.register("firstName")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cart-register-last-name" className="text-xs uppercase">
                  Last name
                </Label>
                <Input
                  id="cart-register-last-name"
                  className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
                  {...registerForm.register("lastName")}
                />
              </div>
            </div>

            <Button type="submit" className="h-12 w-full bg-neutral-950 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : "Create account"}
            </Button>
          </form>
        ) : (
          <form onSubmit={onLoginSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="cart-login-email" className="text-xs uppercase">
                Email
              </Label>
              <Input
                id="cart-login-email"
                type="email"
                autoComplete="email"
                className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
                {...loginForm.register("email")}
              />
              {loginForm.formState.errors.email && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cart-login-password" className="text-xs uppercase">
                Password
              </Label>
              <Input
                id="cart-login-password"
                type="password"
                autoComplete="current-password"
                className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
                {...loginForm.register("password")}
              />
              {loginForm.formState.errors.password && (
                <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="h-12 w-full bg-neutral-950 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Please wait..." : "Log in"}
            </Button>
          </form>
        )}

        <button
          type="button"
          className="mx-auto block text-xs font-medium text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          onClick={() => setMode(mode === "register" ? "login" : "register")}
        >
          {mode === "register" ? "I have an account" : "Create an account"}
        </button>
      </DialogContent>
    </Dialog>
  )
}
