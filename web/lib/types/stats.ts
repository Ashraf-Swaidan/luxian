import type { Order } from "@/lib/types/order"

export type RevenueProfitPoint = {
  date: string
  revenue: number
  profit: number
}

export type StatusCount = {
  status: string
  count: number
}

export type StatsOverview = {
  todayRevenue: number
  todayProfit: number
  monthRevenue: number
  monthProfit: number
  ordersThisMonth: number
  ordersProcessing: number
  productsNeedingRestock: number
  openSupplierOrders: number
  byStatus: StatusCount[]
  revenueSparkline: RevenueProfitPoint[]
  recentOrders: Order[]
}

export type PeriodTotals = {
  revenue: number
  profit: number
}

export type StatsSales = {
  trend: RevenueProfitPoint[]
  today: PeriodTotals
  thisMonth: PeriodTotals
  selectedMonth: PeriodTotals
}

export type StatsOrders = {
  byStatus: StatusCount[]
  overTime: { date: string; count: number }[]
  averageOrderValue: number
  topCollections: {
    collectionId: string
    name: string
    unitsSold: number
    revenue: number
  }[]
  topCategories: {
    categoryId: string
    name: string
    unitsSold: number
    revenue: number
  }[]
  recentOrders: Order[]
}

export type StatsProducts = {
  needingRestock: {
    id: string
    name: string
    sku: string
    stock: number
    restockLimit: number
    incomingStock: number
  }[]
  topProducts: {
    productId: string
    name: string
    sku: string
    unitsSold: number
    revenue: number
    profit: number
  }[]
}

export type StatsCustomers = {
  topCustomers: {
    userId: string
    email: string
    firstName: string | null
    lastName: string | null
    orderCount: number
    totalSpent: number
  }[]
  newCustomersOverTime: { month: string; count: number }[]
}

export type StatsSuppliers = {
  spendingTrend: { month: string; spent: number; orderCount: number }[]
  topSuppliers: {
    supplierId: string
    name: string
    orderCount: number
    totalSpent: number
  }[]
  byStatus: StatusCount[]
  openOrdersCount: number
  itemsOnTheWay: number
}

export type SalesGranularity = "daily" | "monthly" | "yearly"

export type StatsPeriodParams = {
  year?: number
  month?: number
}

export type StatsSalesParams = StatsPeriodParams & {
  granularity?: SalesGranularity
}
