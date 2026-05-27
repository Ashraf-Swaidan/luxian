import { clearAuth, getAccessToken, getRefreshToken, saveAuth } from "@/lib/auth-storage"
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

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE"
  body?: unknown
  token?: string | null
  headers?: HeadersInit
  /** Skip Bearer header (login, register, refresh) */
  auth?: boolean
  /** Internal: prevent infinite refresh loops */
  _retry?: boolean
}

async function parseBody<T>(response: Response): Promise<T> {
  const text = await response.text()
  if (!text) {
    return undefined as T
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return JSON.parse(text) as T
  }

  return text as T
}

let refreshInFlight: Promise<boolean> | null = null

async function refreshTokens(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearAuth()
    return false
  }

  if (!refreshInFlight) {
    refreshInFlight = request<AuthResponse>("auth/refresh", {
      method: "POST",
      body: { refreshToken },
      auth: false,
    })
      .then((response) => {
        saveAuth(response)
        return true
      })
      .catch(() => {
        clearAuth()
        return false
      })
      .finally(() => {
        refreshInFlight = null
      })
  }

  return refreshInFlight
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers, auth = true, _retry = false } = options
  const base = getBaseUrl()
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : ""
  const url = `${base}${normalizedPath}`

  const requestHeaders = new Headers(headers)
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json")
  }

  const bearer = token ?? (auth ? getAccessToken() : null)
  if (bearer) {
    requestHeaders.set("Authorization", `Bearer ${bearer}`)
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (response.status === 401 && auth && !_retry) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      return request<T>(path, { ...options, _retry: true })
    }
  }

  if (!response.ok) {
    try {
      const errorBody = (await parseBody<ApiErrorBody>(response)) as ApiErrorBody
      if (errorBody?.statusCode && errorBody?.message) {
        throw new ApiError(errorBody)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
    }
    throw new Error(`${method} ${url} failed with ${response.status}`)
  }

  return parseBody<T>(response)
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
  const { token, auth = true, _retry = false } = options
  const base = getBaseUrl()
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = `${base}${normalizedPath}`

  const requestHeaders = new Headers()
  const bearer = token ?? (auth ? getAccessToken() : null)
  if (bearer) {
    requestHeaders.set("Authorization", `Bearer ${bearer}`)
  }

  const response = await fetch(url, {
    method: "POST",
    headers: requestHeaders,
    body: formData,
  })

  if (response.status === 401 && auth && !_retry) {
    const refreshed = await refreshTokens()
    if (refreshed) {
      return uploadRequest<T>(path, formData, { ...options, _retry: true })
    }
  }

  if (!response.ok) {
    try {
      const errorBody = (await parseBody<ApiErrorBody>(response)) as ApiErrorBody
      if (errorBody?.statusCode && errorBody?.message) {
        throw new ApiError(errorBody)
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
    }
    throw new Error(`POST ${url} failed with ${response.status}`)
  }

  return parseBody<T>(response)
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
