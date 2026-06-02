import type { AuthUser, Permission } from "@/lib/types/auth"

export const PERMISSIONS = {
  DASHBOARD_READ: "dashboard:read",
  ORDERS_READ: "orders:read",
  ORDERS_WRITE: "orders:write",
  PRODUCTS_READ: "products:read",
  PRODUCTS_WRITE: "products:write",
  PRODUCTS_COST_READ: "products:cost:read",
  PRODUCTS_COST_WRITE: "products:cost:write",
  MEDIA_WRITE: "media:write",
  HOMEPAGE_WRITE: "homepage:write",
  CATALOG_WRITE: "catalog:write",
  SUPPLIERS_READ: "suppliers:read",
  SUPPLIERS_WRITE: "suppliers:write",
  STAFF_MANAGE: "staff:manage",
} as const

export function hasPermission(
  user: AuthUser | null | undefined,
  permission: Permission | Permission[],
): boolean {
  if (!user) {
    return false
  }

  if (user.role === "ADMIN") {
    return true
  }

  const required = Array.isArray(permission) ? permission : [permission]
  return required.every((key) => user.permissions.includes(key))
}

export function hasAnyPermission(
  user: AuthUser | null | undefined,
  permissions: Permission[],
): boolean {
  if (!user) {
    return false
  }

  if (user.role === "ADMIN") {
    return true
  }

  return permissions.some((key) => user.permissions.includes(key))
}

export function canAccessAdmin(user: AuthUser | null | undefined): boolean {
  if (!user) {
    return false
  }

  if (user.role === "ADMIN") {
    return true
  }

  return user.role === "STAFF" && user.permissions.length > 0
}

export function canReadProductCost(user: AuthUser | null | undefined): boolean {
  return hasPermission(user, PERMISSIONS.PRODUCTS_COST_READ)
}

export function canWriteProductCost(user: AuthUser | null | undefined): boolean {
  return hasPermission(user, PERMISSIONS.PRODUCTS_COST_WRITE)
}
