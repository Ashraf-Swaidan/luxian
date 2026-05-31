"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toastApiError } from "@/lib/error-message"
import { loginSchema, type LoginFormValues } from "@/lib/validations/auth"
import { useAuth } from "@/providers/auth-provider"

export function LoginForm() {
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get("redirect") ?? "/"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values)
      toast.success("Welcome back")
      router.replace(redirect)
    } catch (error) {
      toastApiError(error)
    }
  })

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs uppercase">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
            {...register("email")}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-xs uppercase">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="h-12 w-full bg-neutral-950 text-white" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : "Log in"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link href="/register" className="font-medium text-foreground underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </div>
  )
}
