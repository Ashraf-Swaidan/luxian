export const SESSION_EXPIRED_EVENT = "luxian:session-expired"

export function dispatchSessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT))
  }
}
