import { clearAuth, saveUser } from "@/lib/auth-storage"
import { getCsrfTokenFromCookie } from "@/lib/csrf"
import { dispatchSessionExpired } from "@/lib/session-events"
import type { AuthResponse } from "@/lib/types/auth"

/** Matches Nest `HttpExceptionFilter` error body */
export type ApiErrorBody = {
  statusCode: number
  message: string | string[]
  path: string
  timestamp: string
  error?: string
}

export class ApiError extends Error {
  readonly statusCode: number
  readonly path: string
  readonly timestamp: string
  readonly messages: string[]

  constructor(body: ApiErrorBody) {
    const messages = Array.isArray(body.message) ? body.message : [body.message]
    super(messages.join("; "))
    this.name = "ApiError"
    this.statusCode = body.statusCode
    this.path = body.path
    this.timestamp = body.timestamp
    this.messages = messages
  }
}

function getBaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_API_URL
  if (!url) {
    throw new Error("NEXT_PUBLIC_API_URL is not set")
  }
  return url.replace(/\/$/, "")
}

function getRequestTimeoutMs(): number {
  const value = Number(process.env.NEXT_PUBLIC_API_TIMEOUT_MS)
  return Number.isFinite(value) && value > 0 ? value : 15_000
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  headers?: HeadersInit
  /** Include session cookies (default true for authenticated API calls) */
  auth?: boolean
  /** Internal: prevent infinite refresh loops */
  _retry?: boolean
}

const MUTATING_METHODS = new Set(["POST", "PATCH", "DELETE", "PUT"])

function mergeHeaders(base?: HeadersInit, extra?: HeadersInit): Headers {
  const merged = new Headers(base)
  if (extra) {
    new Headers(extra).forEach((value, key) => {
      merged.set(key, value)
    })
  }
  return merged
}

function createTimeoutSignal() {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), getRequestTimeoutMs())

  return { signal: controller.signal, clear: () => clearTimeout(timeoutId) }
}

function parseJsonBody<T>(text: string): T | null {
  if (!text) {
    return null
  }
  try {
    return JSON.parse(text) as T
  } catch {
    return null
  }
}

function getErrorMessageText(body: ApiErrorBody): string {
  return Array.isArray(body.message) ? body.message.join(" ") : body.message
}

function isInvalidCsrfError(status: number, body: ApiErrorBody | null): boolean {
  if (status !== 403 || !body) {
    return false
  }
  return getErrorMessageText(body).toLowerCase().includes("csrf")
}

function shouldAttemptSessionRefresh(status: number, body: ApiErrorBody | null): boolean {
  return status === 401 || isInvalidCsrfError(status, body)
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  if (!refreshInFlight) {
    const base = getBaseUrl()
    refreshInFlight = fetch(`${base}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then(async (response) => {
        if (!response.ok) {
          return false
        }
        const body = (await response.json()) as AuthResponse
        saveUser(body.user)
        return true
      })
      .catch(() => false)
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

async function handleAuthFailure() {
  clearAuth()
  dispatchSessionExpired()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers, auth = true, _retry = false } = options
  const base = getBaseUrl()
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : ""
  const url = `${base}${normalizedPath}`

  const requestHeaders = mergeHeaders(headers)
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json")
  }

  if (auth && MUTATING_METHODS.has(method)) {
    const csrf = getCsrfTokenFromCookie()
    if (csrf) {
      requestHeaders.set("X-CSRF-Token", csrf)
    }
  }

  const timeout = createTimeoutSignal()
  let response: Response
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: "include",
      signal: timeout.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`${method} ${url} timed out after ${getRequestTimeoutMs()}ms`)
    }
    throw error
  } finally {
    timeout.clear()
  }

  const text = await response.text()

  if (!response.ok) {
    const errorBody = parseJsonBody<ApiErrorBody>(text)

    if (auth && !_retry && shouldAttemptSessionRefresh(response.status, errorBody)) {
      const refreshed = await refreshTokens()
      if (refreshed) {
        return request<T>(path, { ...options, _retry: true })
      }
      await handleAuthFailure()
    }

    if (errorBody?.statusCode && errorBody?.message) {
      throw new ApiError(errorBody)
    }
    throw new Error(`${method} ${url} failed with ${response.status}`)
  }

  return (parseJsonBody<T>(text) ?? (undefined as T))
}

export type UploadImageResponse = {
  url: string
  key: string
}

async function uploadRequest<T>(
  path: string,
  formData: FormData,
  options: Omit<RequestOptions, "method" | "body" | "headers"> = {},
): Promise<T> {
  const { auth = true, _retry = false } = options
  const base = getBaseUrl()
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = `${base}${normalizedPath}`

  const requestHeaders = new Headers()
  if (auth) {
    const csrf = getCsrfTokenFromCookie()
    if (csrf) {
      requestHeaders.set("X-CSRF-Token", csrf)
    }
  }

  const timeout = createTimeoutSignal()
  let response: Response
  try {
    response = await fetch(url, {
      method: "POST",
      headers: requestHeaders,
      body: formData,
      credentials: "include",
      signal: timeout.signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(`POST ${url} timed out after ${getRequestTimeoutMs()}ms`)
    }
    throw error
  } finally {
    timeout.clear()
  }

  const text = await response.text()

  if (!response.ok) {
    const errorBody = parseJsonBody<ApiErrorBody>(text)

    if (auth && !_retry && shouldAttemptSessionRefresh(response.status, errorBody)) {
      const refreshed = await refreshTokens()
      if (refreshed) {
        return uploadRequest<T>(path, formData, { ...options, _retry: true })
      }
      await handleAuthFailure()
    }

    if (errorBody?.statusCode && errorBody?.message) {
      throw new ApiError(errorBody)
    }
    throw new Error(`POST ${url} failed with ${response.status}`)
  }

  return (parseJsonBody<T>(text) ?? (undefined as T))
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),

  upload: <T>(path: string, formData: FormData, options?: Omit<RequestOptions, "method" | "body" | "headers">) =>
    uploadRequest<T>(path, formData, options),
}

/** `GET /api/v1` health check — returns plain string from Nest */
export function pingApi() {
  return api.get<string>("", { auth: false })
}
