"use client"

import { useQuery } from "@tanstack/react-query"

import { getStatsOrders } from "@/features/stats/api"
import { queryKeys } from "@/lib/query-keys"
import {
  CountLineChart,
  HorizontalBarChart,
  StatusDonutChart,
} from "./dashboard-charts"
import {
  DashboardKpiCard,
  DashboardLoading,
  DashboardSection,
  formatUsd,
} from "./dashboard-shared"
import { RecentOrdersTable } from "./recent-orders-table"

export function OrdersTab() {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.stats.orders(),
    queryFn: () => getStatsOrders(),
  })

  if (isPending) {
    return <DashboardLoading rows={4} />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Could not load order insights.</p>
  }

  return (
    <div className="space-y-6">
      <DashboardKpiCard
        label="Average order value"
        value={formatUsd(data.averageOrderValue)}
        className="max-w-sm"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardSection title="Orders over time" description="Last 12 months">
            <CountLineChart data={data.overTime} />
          </DashboardSection>
        </div>
        <DashboardSection title="By status" description="All orders">
          <StatusDonutChart data={data.byStatus} />
        </DashboardSection>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSection title="Top collections" description="By units sold">
          <HorizontalBarChart
            data={data.topCollections.map((row) => ({
              name: row.name,
              unitsSold: row.unitsSold,
            }))}
            nameKey="name"
            valueKey="unitsSold"
            valueLabel="Units sold"
          />
        </DashboardSection>
        <DashboardSection title="Top categories" description="By units sold">
          <HorizontalBarChart
            data={data.topCategories.map((row) => ({
              name: row.name,
              unitsSold: row.unitsSold,
            }))}
            nameKey="name"
            valueKey="unitsSold"
            valueLabel="Units sold"
          />
        </DashboardSection>
      </div>

      <DashboardSection title="Recent orders">
        <RecentOrdersTable orders={data.recentOrders} />
      </DashboardSection>
    </div>
  )
}
