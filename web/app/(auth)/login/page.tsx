"use client"

import { Suspense } from "react"

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-6xl items-center px-6 py-10">
      <Suspense fallback={<div className="mx-auto h-64 w-full max-w-md animate-pulse rounded-2xl bg-muted" />}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
