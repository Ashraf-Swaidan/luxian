/** Prisma Decimal serializes as string in JSON — format for display only */
export function formatPrice(price: string | number, currency = "USD") {
  const amount = typeof price === "string" ? Number.parseFloat(price) : price
  if (Number.isNaN(amount)) {
    return "—"
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}
