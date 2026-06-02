"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import {
  getMeRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
} from "@/features/auth/api"
import { clearAuth, getStoredUser, saveUser } from "@/lib/auth-storage"
import type { AuthUser, LoginInput, RegisterInput } from "@/lib/types/auth"

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  login: (input: LoginInput) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const bootstrap = useCallback(async () => {
    const cached = getStoredUser()
    if (cached) {
      setUser(cached)
    }

    try {
      const me = await getMeRequest()
      setUser(me)
      saveUser(me)
    } catch {
      clearAuth()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  const login = useCallback(async (input: LoginInput) => {
    const response = await loginRequest(input)
    saveUser(response.user)
    setUser(response.user)
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const response = await registerRequest(input)
    saveUser(response.user)
    setUser(response.user)
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } finally {
      clearAuth()
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, register, logout }),
    [user, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
