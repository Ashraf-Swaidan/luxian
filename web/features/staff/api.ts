import { api } from "@/lib/api-client"
import type { Permission } from "@/lib/types/auth"

export type StaffPermissionOption = {
  key: Permission
  label: string
}

export type StaffRole = {
  id: string
  name: string
  slug: string
  description: string | null
  isSystem: boolean
  permissions: Array<{ id: string; permission: Permission }>
}

export type StaffUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  isStaffActive: boolean
  staffRoleId: string | null
  staffRole: { id: string; name: string; slug: string } | null
  createdAt: string
}

export function getStaffPermissions() {
  return api.get<StaffPermissionOption[]>("staff/permissions")
}

export function getStaffRoles() {
  return api.get<StaffRole[]>("staff/roles")
}

export function createStaffRole(body: {
  name: string
  slug: string
  description?: string
  permissions: Permission[]
}) {
  return api.post<StaffRole>("staff/roles", body)
}

export function updateStaffRole(
  id: string,
  body: Partial<{ name: string; slug: string; description?: string; permissions: Permission[] }>,
) {
  return api.patch<StaffRole>(`staff/roles/${id}`, body)
}

export function deleteStaffRole(id: string) {
  return api.delete<{ message: string }>(`staff/roles/${id}`)
}

export function getStaffUsers() {
  return api.get<StaffUser[]>("staff/users")
}

export function createStaffUser(body: {
  email: string
  password: string
  staffRoleId: string
  firstName?: string
  lastName?: string
}) {
  return api.post<StaffUser>("staff/users", body)
}

export function updateStaffUser(
  id: string,
  body: Partial<{
    firstName?: string
    lastName?: string
    staffRoleId: string
    isStaffActive: boolean
    password?: string
  }>,
) {
  return api.patch<StaffUser>(`staff/users/${id}`, body)
}
