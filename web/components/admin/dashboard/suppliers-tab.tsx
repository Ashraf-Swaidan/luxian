"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getStatsSuppliers } from "@/features/stats/api"
import { queryKeys } from "@/lib/query-keys"
import {
  chartLabelForRank,
  chartValueForRank,
  chartValueFormatter,
  SUPPLIER_RANK_OPTIONS,
  type StatsRankBy,
} from "@/lib/stats-ranking"

import {
  HorizontalBarChart,
  SpendingAreaChart,
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

export function SuppliersTab() {
  const [rankBy, setRankBy] = useState<StatsRankBy>("balanced")

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.stats.suppliers({ rankBy }),
    queryFn: () => getStatsSuppliers({ rankBy }),
  })

  if (isPending) {
    return <DashboardLoading rows={4} />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Could not load supplier insights.</p>
  }

  const supplierChart = data.topSuppliers.map((row) => ({
    name: row.name,
    value: chartValueForRank(rankBy, row, data.topSuppliers),
  }))

  return (
    <div className="space-y-6">
      <RankBySelect value={rankBy} onChange={setRankBy} options={SUPPLIER_RANK_OPTIONS} />

      <div className="grid gap-4 sm:grid-cols-2">
        <DashboardKpiCard label="Open supplier orders" value={String(data.openOrdersCount)} />
        <DashboardKpiCard label="Units on the way" value={String(data.itemsOnTheWay)} />
      </div>

      <DashboardSection title="Spending trend" description="Received supplier orders, last 12 months">
        <SpendingAreaChart data={data.spendingTrend} />
      </DashboardSection>

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardSection title="Top suppliers" description={`Ranked by ${chartLabelForRank(rankBy).toLowerCase()}`}>
          {data.topSuppliers.length === 0 ? (
            <DashboardEmpty message="No received supplier orders yet." />
          ) : (
            <>
              <HorizontalBarChart
                compact
                data={supplierChart}
                nameKey="name"
                valueKey="value"
                valueLabel={chartLabelForRank(rankBy)}
                valueFormatter={(value) => chartValueFormatter(rankBy, value)}
              />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-xs tracking-wide text-muted-foreground uppercase">
                      <th className="pb-3 pr-4 font-medium">Supplier</th>
                      <th className="pb-3 pr-4 font-medium">Orders</th>
                      <th className="pb-3 font-medium">Spent</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topSuppliers.map((row) => (
                      <tr key={row.supplierId} className="border-b border-border/40 last:border-0">
                        <td className="py-3 pr-4 font-medium">{row.name}</td>
                        <td className="py-3 pr-4 tabular-nums">{row.orderCount}</td>
                        <td className="py-3 tabular-nums">{formatUsd(row.totalSpent)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DashboardSection>

        <DashboardSection title="Orders by status" description="All supplier orders">
          <StatusDonutChart data={data.byStatus} />
        </DashboardSection>
      </div>
    </div>
  )
}
