import { api } from "@/lib/api-client"
import { getVisitorId } from "@/lib/visitor-id"
import type { Product } from "@/lib/types/product"

export type VisitorEventType =
  | "SEARCH"
  | "PRODUCT_CLICK"
  | "PRODUCT_VIEW"
  | "CATEGORY_FILTER"
  | "COLLECTION_FILTER"

export type RecordVisitorEventInput = {
  eventType: VisitorEventType
  productId?: string
  categoryId?: string
  collectionId?: string
  search?: string
}

function withVisitorHeaders(): { headers: HeadersInit; auth: false } {
  return {
    headers: { "X-Visitor-Id": getVisitorId() },
    auth: false,
  }
}

export function recordVisitorEvent(input: RecordVisitorEventInput) {
  const visitorId = getVisitorId()
  if (!visitorId) {
    return Promise.resolve({ id: "" })
  }

  return api.post<{ id: string }>(
    "personalization/events",
    {
      visitorId,
      ...input,
    },
    withVisitorHeaders(),
  )
}

/** Fire-and-forget; never blocks UI on tracking failures. */
export function trackVisitorEvent(input: RecordVisitorEventInput) {
  void recordVisitorEvent(input).catch(() => {})
}

export function getPersonalizedRecommendations(limit = 12) {
  const visitorId = getVisitorId()
  if (!visitorId) {
    return Promise.resolve([] as Product[])
  }

  return api.get<Product[]>(`personalization/recommendations?limit=${limit}`, withVisitorHeaders())
}
