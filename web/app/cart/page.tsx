import { RequireAuth } from "@/components/require-auth"

export default function CartPage() {
  return (
    <RequireAuth>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-2xl font-medium">Cart</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cart UI comes in Phase D. You reached this page because auth is working.
        </p>
      </main>
    </RequireAuth>
  )
}
