"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getAuthActionErrorMessage } from "@/lib/error-message"
import { registerSchema, type RegisterFormValues } from "@/lib/validations/auth"
import { useAuth } from "@/providers/auth-provider"

export function RegisterForm() {
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await registerUser(values)
      toast.success("Account created")
      router.replace("/")
    } catch (error) {
      setFormError(getAuthActionErrorMessage(error, "Could not create your account. Please try again."))
    }
  })

  return (
    <div>
      <form onSubmit={onSubmit} className="space-y-5">
        {formError ? (
          <p
            className="border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800"
            role="alert"
          >
            {formError}
          </p>
        ) : null}

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
            autoComplete="new-password"
            className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
            {...register("password")}
          />
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-xs uppercase">
              First name
            </Label>
            <Input
              id="firstName"
              className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
              {...register("firstName")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-xs uppercase">
              Last name
            </Label>
            <Input
              id="lastName"
              className="border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0"
              {...register("lastName")}
            />
          </div>
        </div>

        <Button type="submit" className="h-12 w-full bg-neutral-950 text-white" disabled={isSubmitting}>
          {isSubmitting ? "Please wait..." : "Create account"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  )
}
