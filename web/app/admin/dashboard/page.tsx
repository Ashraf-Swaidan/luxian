import { AdminDashboardPanel } from "@/components/admin/admin-dashboard-panel"
import { RequirePermission } from "@/components/auth/require-permission"
import { PERMISSIONS } from "@/lib/permissions"

export default function AdminDashboardPage() {
  return (
    <RequirePermission permission={PERMISSIONS.DASHBOARD_READ}>
      <AdminDashboardPanel />
    </RequirePermission>
  )
}
