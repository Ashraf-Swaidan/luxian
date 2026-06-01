import "server-only"

import type { ApiErrorBody } from "@/lib/api-client"

export class ServerApiError extends Error {
  readonly statusCode: number
  readonly messages: string[]

  constructor(
    message: string,
    statusCode: number,
    readonly body?: unknown
  ) {
    super(message)
    this.name = "ServerApiError"
    this.statusCode = statusCode
    this.messages = [message]
  }
}

function getServerApiBaseUrl() {
  const url = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL
  if (!url) {
    throw new Error("API_INTERNAL_URL or NEXT_PUBLIC_API_URL is required")
  }
  return url.replace(/\/$/, "")
}

async function parseResponseBody(response: Response) {
  const text = await response.text()
  if (!text) {
    return undefined
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    return JSON.parse(text) as unknown
  }

  return text
}

export async function serverApiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : ""
  const url = `${getServerApiBaseUrl()}${normalizedPath}`
  const response = await fetch(url, {
    ...init,
    method: "GET",
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
  })

  const body = await parseResponseBody(response)
  if (!response.ok) {
    const errorBody = body as Partial<ApiErrorBody> | undefined
    const message = Array.isArray(errorBody?.message)
      ? errorBody.message.join(", ")
      : errorBody?.message || `${response.status} response from store service`
    throw new ServerApiError(message, response.status, body)
  }

  return body as T
}
