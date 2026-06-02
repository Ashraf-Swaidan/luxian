export type StatsRankBy =
  | "balanced"
  | "units"
  | "revenue"
  | "profit"
  | "orders"
  | "spent"

export type RankableMetrics = {
  unitsSold?: number
  revenue?: number
  profit?: number
  orderCount?: number
  totalSpent?: number
}

const METRIC_KEYS: (keyof RankableMetrics)[] = [
  "unitsSold",
  "revenue",
  "profit",
  "orderCount",
  "totalSpent",
]

export const PRODUCT_RANK_OPTIONS: { value: StatsRankBy; label: string }[] = [
  { value: "balanced", label: "Balanced score" },
  { value: "units", label: "Units sold" },
  { value: "revenue", label: "Revenue" },
  { value: "profit", label: "Profit" },
]

export const CUSTOMER_RANK_OPTIONS: { value: StatsRankBy; label: string }[] = [
  { value: "balanced", label: "Balanced score" },
  { value: "spent", label: "Total spent" },
  { value: "orders", label: "Order count" },
]

export const SUPPLIER_RANK_OPTIONS: { value: StatsRankBy; label: string }[] = [
  { value: "balanced", label: "Balanced score" },
  { value: "spent", label: "Total spent" },
  { value: "orders", label: "Order count" },
]

function activeMetrics(items: RankableMetrics[]) {
  return METRIC_KEYS.filter((key) => items.some((item) => (item[key] ?? 0) > 0))
}

function balancedScore(
  item: RankableMetrics,
  maxes: Record<string, number>,
  keys: (keyof RankableMetrics)[],
) {
  if (keys.length === 0) {
    return 0
  }
  const total = keys.reduce((sum, key) => sum + (item[key] ?? 0) / maxes[key], 0)
  return total / keys.length
}

export function chartValueForRank(rankBy: StatsRankBy, row: RankableMetrics, allRows: RankableMetrics[]) {
  switch (rankBy) {
    case "units":
      return row.unitsSold ?? 0
    case "revenue":
      return row.revenue ?? 0
    case "profit":
      return row.profit ?? 0
    case "orders":
      return row.orderCount ?? 0
    case "spent":
      return row.totalSpent ?? 0
    case "balanced":
    default: {
      const keys = activeMetrics(allRows)
      const maxes = Object.fromEntries(
        keys.map((key) => [key, Math.max(...allRows.map((item) => item[key] ?? 0), 1)]),
      ) as Record<string, number>
      return balancedScore(row, maxes, keys)
    }
  }
}

export function chartLabelForRank(rankBy: StatsRankBy) {
  switch (rankBy) {
    case "units":
      return "Units sold"
    case "revenue":
      return "Revenue"
    case "profit":
      return "Profit"
    case "orders":
      return "Orders"
    case "spent":
      return "Total spent"
    case "balanced":
    default:
      return "Balanced score"
  }
}

export function chartValueFormatter(rankBy: StatsRankBy, value: number) {
  if (rankBy === "units" || rankBy === "orders") {
    return String(Math.round(value))
  }
  if (rankBy === "balanced") {
    return value.toFixed(2)
  }
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
}
