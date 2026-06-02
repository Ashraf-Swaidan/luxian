import { AdminStaffPanel } from "@/components/admin/admin-staff-panel"
import { RequirePermission } from "@/components/auth/require-permission"
import { PERMISSIONS } from "@/lib/permissions"

export default function AdminStaffPage() {
  return (
    <RequirePermission permission={PERMISSIONS.STAFF_MANAGE}>
      <AdminStaffPanel />
    </RequirePermission>
  )
}
