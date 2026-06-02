"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getStatsOrders } from "@/features/stats/api"
import { queryKeys } from "@/lib/query-keys"
import {
  chartLabelForRank,
  chartValueForRank,
  chartValueFormatter,
  PRODUCT_RANK_OPTIONS,
  type StatsRankBy,
} from "@/lib/stats-ranking"

import {
  CountLineChart,
  HorizontalBarChart,
  StatusDonutChart,
} from "./dashboard-charts"
import {
  DashboardKpiCard,
  DashboardEmpty,
  DashboardLoading,
  DashboardSection,
  formatUsd,
  RankBySelect,
} from "./dashboard-shared"
import { RecentOrdersTable } from "./recent-orders-table"

export function OrdersTab() {
  const [rankBy, setRankBy] = useState<StatsRankBy>("balanced")

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.stats.orders({ rankBy }),
    queryFn: () => getStatsOrders({ rankBy }),
  })

  if (isPending) {
    return <DashboardLoading rows={4} />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Could not load order insights.</p>
  }

  const collectionChart = data.topCollections.map((row) => ({
    name: row.name,
    value: chartValueForRank(rankBy, row, data.topCollections),
  }))

  const categoryChart = data.topCategories.map((row) => ({
    name: row.name,
    value: chartValueForRank(rankBy, row, data.topCategories),
  }))

  return (
    <div className="space-y-6">
      <RankBySelect value={rankBy} onChange={setRankBy} options={PRODUCT_RANK_OPTIONS} />

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
        <DashboardSection title="Top collections" description={`Ranked by ${chartLabelForRank(rankBy).toLowerCase()}`}>
          {data.topCollections.length === 0 ? (
            <DashboardEmpty message="No collection sales yet." />
          ) : (
            <HorizontalBarChart
              compact
              data={collectionChart}
              nameKey="name"
              valueKey="value"
              valueLabel={chartLabelForRank(rankBy)}
              valueFormatter={(value) => chartValueFormatter(rankBy, value)}
            />
          )}
        </DashboardSection>
        <DashboardSection title="Top categories" description={`Ranked by ${chartLabelForRank(rankBy).toLowerCase()}`}>
          {data.topCategories.length === 0 ? (
            <DashboardEmpty message="No category sales yet." />
          ) : (
            <HorizontalBarChart
              compact
              data={categoryChart}
              nameKey="name"
              valueKey="value"
              valueLabel={chartLabelForRank(rankBy)}
              valueFormatter={(value) => chartValueFormatter(rankBy, value)}
            />
          )}
        </DashboardSection>
      </div>

      <DashboardSection title="Recent orders">
        <RecentOrdersTable orders={data.recentOrders} />
      </DashboardSection>
    </div>
  )
}
