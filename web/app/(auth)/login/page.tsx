"use client"

import { Suspense } from "react"

import { AuthShowcaseLayout } from "@/components/auth/auth-showcase-layout"
import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthShowcaseLayout
      eyebrow="Account access"
      title="Welcome Back"
      body="Sign in to track orders, manage your bag, and keep your Luxian edit close."
      imageSrc="/hero-assets/login-hero.png"
      imageAlt="Luxian editorial login campaign"
    >
      <Suspense fallback={<div className="h-64 w-full animate-pulse bg-white/60" />}>
        <LoginForm />
      </Suspense>
    </AuthShowcaseLayout>
  )
}
