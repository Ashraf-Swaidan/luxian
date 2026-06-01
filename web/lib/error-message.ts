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

export function getFriendlyErrorMessage(error: unknown): string {
  const message = getErrorMessage(error).toLowerCase()

  if (
    message.includes("connection terminated due to connection timeout") ||
    message.includes("timed out") ||
    message.includes("failed to fetch")
  ) {
    return "We are having trouble loading the latest store details right now. Please refresh in a moment."
  }

  if (error instanceof ApiError && error.statusCode >= 500) {
    return "Something went wrong while loading the store. Please refresh in a moment."
  }

  if (error instanceof ApiError && error.statusCode === 401) {
    return "Your session needs attention. Log in again to continue."
  }

  if (error instanceof ApiError && error.statusCode === 403) {
    return "You do not have access to this area."
  }

  return getErrorMessage(error)
}

export function toastApiError(error: unknown, fallback?: string) {
  toast.error(getFriendlyErrorMessage(error) || getErrorMessage(error, fallback))
}
