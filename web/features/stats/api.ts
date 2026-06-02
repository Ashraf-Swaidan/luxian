import { api } from "@/lib/api-client"
import type {
  StatsCustomers,
  StatsOrders,
  StatsOverview,
  StatsPeriodParams,
  StatsProducts,
  StatsSales,
  StatsSalesParams,
  StatsSuppliers,
} from "@/lib/types/stats"

function buildStatsQuery(params?: StatsPeriodParams & { granularity?: string }) {
  if (!params) {
    return ""
  }

  const search = new URLSearchParams()
  if (params.year !== undefined) {
    search.set("year", String(params.year))
  }
  if (params.month !== undefined) {
    search.set("month", String(params.month))
  }
  if ("granularity" in params && params.granularity) {
    search.set("granularity", params.granularity)
  }
  if (params.rankBy) {
    search.set("rankBy", params.rankBy)
  }

  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

export function getStatsOverview() {
  return api.get<StatsOverview>("admin/stats/overview")
}

export function getStatsSales(params?: StatsSalesParams) {
  return api.get<StatsSales>(`admin/stats/sales${buildStatsQuery(params)}`)
}

export function getStatsOrders(params?: StatsPeriodParams) {
  return api.get<StatsOrders>(`admin/stats/orders${buildStatsQuery(params)}`)
}

export function getStatsProducts(params?: StatsPeriodParams) {
  return api.get<StatsProducts>(`admin/stats/products${buildStatsQuery(params)}`)
}

export function getStatsCustomers(params?: StatsPeriodParams) {
  return api.get<StatsCustomers>(`admin/stats/customers${buildStatsQuery(params)}`)
}

export function getStatsSuppliers(params?: StatsPeriodParams) {
  return api.get<StatsSuppliers>(`admin/stats/suppliers${buildStatsQuery(params)}`)
}
