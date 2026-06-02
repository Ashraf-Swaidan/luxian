import type { AuthUser } from "@/lib/types/auth"

const USER_KEY = "luxian_user"

function canUseStorage() {
  return typeof window !== "undefined"
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

export function saveUser(user: AuthUser) {
  if (!canUseStorage()) return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  if (!canUseStorage()) return
  localStorage.removeItem(USER_KEY)
}
