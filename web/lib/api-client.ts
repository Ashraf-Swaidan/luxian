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

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, headers } = options
  const base = getBaseUrl()
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : ""
  const url = `${base}${normalizedPath}`

  const requestHeaders = new Headers(headers)
  if (body !== undefined && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json")
  }
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`)
  }

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

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

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),

  post: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(path, { ...options, method: "POST", body }),

  patch: <T>(
    path: string,
    body?: unknown,
    options?: Omit<RequestOptions, "method" | "body">,
  ) => request<T>(path, { ...options, method: "PATCH", body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
}

/** `GET /api/v1` health check — returns plain string from Nest */
export function pingApi() {
  return api.get<string>("")
}
