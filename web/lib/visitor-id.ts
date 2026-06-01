const STORAGE_KEY = "luxian_visitor_id"

function createVisitorId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return "00000000-0000-4000-8000-000000000000".replace(/0/g, () =>
    Math.floor(Math.random() * 16).toString(16),
  )
}

/** Stable anonymous visitor id for personalization (browser only). */
export function getVisitorId(): string {
  if (typeof window === "undefined") {
    return ""
  }

  try {
    const existing = window.localStorage.getItem(STORAGE_KEY)
    if (existing) {
      return existing
    }
    const next = createVisitorId()
    window.localStorage.setItem(STORAGE_KEY, next)
    return next
  } catch {
    return createVisitorId()
  }
}

export function getVisitorIdHeaders(): HeadersInit {
  const visitorId = getVisitorId()
  if (!visitorId) {
    return {}
  }
  return { "X-Visitor-Id": visitorId }
}
