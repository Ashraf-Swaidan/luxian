import { ApiError } from "@/lib/api-client"
import { toast } from "sonner"

/** Normalize Nest filter errors and generic failures for UI copy */
export function getErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof ApiError) {
    return error.messages.join(", ")
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

const SESSION_EXPIRED_MESSAGE = "Your session expired. Please sign in again."

/** Map API auth messages to clearer copy for login/register flows */
function humanizeAuthMessage(message: string): string {
  const normalized = message.trim().toLowerCase()

  if (normalized.includes("invalid credentials") || normalized === "unauthorized") {
    return "Email or password is incorrect."
  }
  if (normalized.includes("deactivated")) {
    return "This account has been deactivated. Contact your store administrator."
  }
  if (normalized.includes("user already exists") || normalized.includes("already exists")) {
    return "An account with this email already exists."
  }
  if (normalized.includes("invalid refresh")) {
    return "Your session expired. Please sign in again."
  }
  if (normalized.includes("refresh token required")) {
    return "Your session expired. Please sign in again."
  }

  return message
}

function isAuthActionPath(path: string): boolean {
  return (
    path.includes("/auth/login") ||
    path.includes("/auth/register") ||
    path.includes("/auth/refresh")
  )
}

function shouldUseSessionExpiredMessage(error: ApiError): boolean {
  const raw = getErrorMessage(error)
  const normalized = raw.toLowerCase()

  if (isAuthActionPath(error.path)) {
    return false
  }

  if (
    normalized.includes("invalid credentials") ||
    normalized.includes("deactivated") ||
    normalized.includes("already exists")
  ) {
    return false
  }

  if (error.path.includes("/auth/me") || error.path.includes("/auth/logout")) {
    return true
  }

  if (
    normalized.includes("invalid token") ||
    normalized === "unauthorized" ||
    raw.length === 0
  ) {
    return true
  }

  return false
}

export type ErrorMessageContext = {
  /** Use on login/register forms — never show “session expired” for wrong password */
  authAction?: boolean
  /** Use when an authenticated request failed (cart, admin, profile) */
  session?: boolean
}

export function getFriendlyErrorMessage(
  error: unknown,
  context?: ErrorMessageContext,
): string {
  const message = getErrorMessage(error).toLowerCase()

  if (
    message.includes("connection terminated due to connection timeout") ||
    message.includes("timed out") ||
    message.includes("failed to fetch")
  ) {
    return "We are having trouble reaching the server. Please check your connection and try again."
  }

  if (error instanceof ApiError && error.statusCode >= 500) {
    return "Something went wrong on our side. Please try again in a moment."
  }

  if (error instanceof ApiError && error.statusCode === 401) {
    if (context?.authAction || isAuthActionPath(error.path)) {
      return humanizeAuthMessage(getErrorMessage(error))
    }
    if (context?.session || shouldUseSessionExpiredMessage(error)) {
      return SESSION_EXPIRED_MESSAGE
    }
    return humanizeAuthMessage(getErrorMessage(error))
  }

  if (error instanceof ApiError && error.statusCode === 403) {
    const raw = getErrorMessage(error)
    if (raw.toLowerCase() === "forbidden" || raw.toLowerCase() === "insufficient permissions") {
      return "You do not have permission to do that."
    }
    return raw
  }

  if (error instanceof ApiError && error.statusCode === 409) {
    return humanizeAuthMessage(getErrorMessage(error))
  }

  return getErrorMessage(error)
}

export function toastApiError(
  error: unknown,
  fallback?: string,
  context?: ErrorMessageContext,
) {
  toast.error(getFriendlyErrorMessage(error, context) || getErrorMessage(error, fallback))
}

/** Login / register — always show the real reason (wrong password, deactivated, etc.) */
export function toastAuthError(error: unknown, fallback = "Could not sign in. Please try again.") {
  toastApiError(error, fallback, { authAction: true })
}

export function getAuthActionErrorMessage(error: unknown, fallback?: string): string {
  return getFriendlyErrorMessage(error, { authAction: true }) || fallback || "Something went wrong"
}
