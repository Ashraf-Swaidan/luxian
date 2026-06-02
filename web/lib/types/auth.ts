export type Role = "USER" | "ADMIN" | "STAFF"

export type Permission =
  | "dashboard:read"
  | "orders:read"
  | "orders:write"
  | "products:read"
  | "products:write"
  | "products:cost:read"
  | "products:cost:write"
  | "media:write"
  | "homepage:write"
  | "catalog:write"
  | "suppliers:read"
  | "suppliers:write"
  | "staff:manage"

export type AuthUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: Role
  permissions: Permission[]
  staffRoleId: string | null
  staffRoleName: string | null
  isStaffActive?: boolean
}

export type AuthResponse = {
  user: AuthUser
  csrfToken: string
}

export type LoginInput = {
  email: string
  password: string
}

export type RegisterInput = {
  email: string
  password: string
  firstName?: string
  lastName?: string
}
