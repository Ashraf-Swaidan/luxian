export type Role = "USER" | "ADMIN"

export type AuthUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: Role
}

export type AuthResponse = {
  accessToken: string
  refreshToken: string
  user: AuthUser
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
