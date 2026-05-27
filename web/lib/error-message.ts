import { ApiError } from "@/lib/api-client"
import { toast } from "sonner"

/** Normalize Nest filter errors and generic failures for UI copy */
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong",
): string {
  if (error instanceof ApiError) {
    return error.messages.join(", ")
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export function toastApiError(error: unknown, fallback?: string) {
  toast.error(getErrorMessage(error, fallback))
}
