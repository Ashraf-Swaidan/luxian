export const queryKeys = {
  health: ["health"] as const,
  categories: {
    all: ["categories"] as const,
  },
  collections: {
    all: ["collections"] as const,
    admin: ["collections", "admin"] as const,
    detail: (id: string) => ["collections", id] as const,
  },
  homepage: ["homepage"] as const,
  media: {
    history: (params: { ownerType: string; ownerId: string; slot: string }) => ["media", "history", params] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params?: {
      search?: string
      categoryId?: string
      collectionId?: string
      collectionSlug?: string
      minPrice?: number
      maxPrice?: number
      minStock?: number
      maxStock?: number
      page?: number
      limit?: number
      personalize?: boolean
    }) => [...queryKeys.products.all, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.products.all, id] as const,
    context: (id: string) => [...queryKeys.products.all, id, "context"] as const,
  },
  cart: ["cart"] as const,
  orders: {
    all: ["orders"] as const,
    detail: (id: string) => [...queryKeys.orders.all, id] as const,
  },
  favorites: {
    all: ["favorites"] as const,
    status: (productId: string) => ["favorites", "status", productId] as const,
  },
  personalization: {
    recommendations: (limit: number) => ["personalization", "recommendations", limit] as const,
  },
}
