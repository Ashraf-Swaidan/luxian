export const queryKeys = {
  health: ["health"] as const,
  products: {
    all: ["products"] as const,
    list: (categoryId?: string) =>
      [...queryKeys.products.all, "list", { categoryId }] as const,
  },
  cart: ["cart"] as const,
  orders: {
    all: ["orders"] as const,
    detail: (id: string) => [...queryKeys.orders.all, id] as const,
  },
}
