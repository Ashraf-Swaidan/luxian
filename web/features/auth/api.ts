import { api } from "@/lib/api-client"
import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from "@/lib/types/auth"

export function loginRequest(body: LoginInput) {
  return api.post<AuthResponse>("auth/login", body, { auth: false })
}

export function registerRequest(body: RegisterInput) {
  return api.post<AuthResponse>("auth/register", body, { auth: false })
}

export function logoutRequest() {
  return api.post<{ message: string }>("auth/logout")
}

export function getMeRequest() {
  return api.get<AuthUser>("auth/me")
}
