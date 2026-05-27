import type { AuthResponse, AuthUser } from "@/lib/types/auth"

const ACCESS_KEY = "luxian_access_token"
const REFRESH_KEY = "luxian_refresh_token"
const USER_KEY = "luxian_user"

function canUseStorage() {
  return typeof window !== "undefined"
}

export function getAccessToken(): string | null {
  if (!canUseStorage()) return null
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken(): string | null {
  if (!canUseStorage()) return null
  return localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser(): AuthUser | null {
  if (!canUseStorage()) return null
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthUser
  } catch {
    return null
  }
}

export function saveAuth(response: AuthResponse) {
  if (!canUseStorage()) return
  localStorage.setItem(ACCESS_KEY, response.accessToken)
  localStorage.setItem(REFRESH_KEY, response.refreshToken)
  localStorage.setItem(USER_KEY, JSON.stringify(response.user))
}

export function clearAuth() {
  if (!canUseStorage()) return
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
}
