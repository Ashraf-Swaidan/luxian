export const queryKeys = {
  health: ["health"] as const,
  categories: {
    all: ["categories"] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params?: {
      search?: string
      categoryId?: string
      minPrice?: number
      maxPrice?: number
      minStock?: number
      maxStock?: number
      page?: number
      limit?: number
    }) => [...queryKeys.products.all, "list", params ?? {}] as const,
    detail: (id: string) => [...queryKeys.products.all, id] as const,
  },
  cart: ["cart"] as const,
  orders: {
    all: ["orders"] as const,
    detail: (id: string) => [...queryKeys.orders.all, id] as const,
  },
}
