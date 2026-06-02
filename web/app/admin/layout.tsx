import { AdminNav } from "@/components/admin/admin-nav"
import { RequireAdmin } from "@/components/auth/require-admin"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RequireAdmin>
      <div className="mx-auto w-full max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Admin
            </p>
            <h1 className="text-2xl font-medium tracking-tight">Store management</h1>
          </div>
          <AdminNav />
        </div>
        {children}
      </div>
    </RequireAdmin>
  )
}
