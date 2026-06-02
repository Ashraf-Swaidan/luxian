"use client"

import { useQuery } from "@tanstack/react-query"

import { getStatsOverview } from "@/features/stats/api"
import { queryKeys } from "@/lib/query-keys"

import { RevenueProfitAreaChart, StatusDonutChart } from "./dashboard-charts"
import {
  DashboardKpiCard,
  DashboardLoading,
  DashboardSection,
  formatUsd,
} from "./dashboard-shared"
import { RecentOrdersTable } from "./recent-orders-table"

export function HomeTab() {
  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.stats.overview,
    queryFn: getStatsOverview,
  })

  if (isPending) {
    return <DashboardLoading rows={4} />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Could not load dashboard overview.</p>
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <DashboardKpiCard label="Today revenue" value={formatUsd(data.todayRevenue)} />
        <DashboardKpiCard label="Today profit" value={formatUsd(data.todayProfit)} />
        <DashboardKpiCard label="Month revenue" value={formatUsd(data.monthRevenue)} />
        <DashboardKpiCard label="Month profit" value={formatUsd(data.monthProfit)} />
        <DashboardKpiCard
          label="Orders this month"
          value={String(data.ordersThisMonth)}
          hint={`${data.ordersProcessing} processing`}
        />
        <DashboardKpiCard
          label="Needs restock"
          value={String(data.productsNeedingRestock)}
          hint={`${data.openSupplierOrders} open supplier orders`}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DashboardSection title="Revenue and profit" description="Last 7 days">
            <RevenueProfitAreaChart data={data.revenueSparkline} />
          </DashboardSection>
        </div>

        <DashboardSection title="Orders by status" description="All orders">
          <StatusDonutChart data={data.byStatus} />
        </DashboardSection>
      </div>

      <DashboardSection title="Recent orders" description="Latest storefront activity">
        <RecentOrdersTable orders={data.recentOrders} />
      </DashboardSection>
    </div>
  )
}
