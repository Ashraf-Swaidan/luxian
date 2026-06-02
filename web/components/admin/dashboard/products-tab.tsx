"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getStatsProducts } from "@/features/stats/api"
import { queryKeys } from "@/lib/query-keys"
import {
  chartLabelForRank,
  chartValueForRank,
  chartValueFormatter,
  PRODUCT_RANK_OPTIONS,
  type StatsRankBy,
} from "@/lib/stats-ranking"

import { HorizontalBarChart } from "./dashboard-charts"
import {
  DashboardEmpty,
  DashboardLoading,
  DashboardSection,
  formatUsd,
  MonthYearFilter,
  ProductNameCell,
  RankBySelect,
  type MonthYearFilterValue,
} from "./dashboard-shared"

export function ProductsTab() {
  const now = new Date()
  const [period, setPeriod] = useState<MonthYearFilterValue>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })
  const [rankBy, setRankBy] = useState<StatsRankBy>("balanced")

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.stats.products({ year: period.year, month: period.month, rankBy }),
    queryFn: () => getStatsProducts({ year: period.year, month: period.month, rankBy }),
  })

  const chartRows = data?.topProducts ?? []
  const chartData = chartRows.map((row) => ({
    name: row.name,
    value: chartValueForRank(rankBy, row, chartRows),
  }))

  if (isPending) {
    return <DashboardLoading rows={3} />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Could not load product insights.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <MonthYearFilter value={period} onChange={setPeriod} showAllTime />
        <RankBySelect value={rankBy} onChange={setRankBy} options={PRODUCT_RANK_OPTIONS} />
      </div>

      <DashboardSection
        title="Needs restock"
        description="Active products at or below their restock limit"
      >
        {data.needingRestock.length === 0 ? (
          <DashboardEmpty message="All active products are above their restock limits." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">Stock</th>
                  <th className="pb-3 pr-4 font-medium">Limit</th>
                  <th className="pb-3 font-medium">Incoming</th>
                </tr>
              </thead>
              <tbody>
                {data.needingRestock.map((product) => (
                  <tr key={product.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pr-4">
                      <ProductNameCell
                        href={`/admin/products/${product.id}`}
                        imageUrl={product.imageUrl}
                        name={product.name}
                        sku={product.sku}
                      />
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{product.stock}</td>
                    <td className="py-3 pr-4 tabular-nums">{product.restockLimit}</td>
                    <td className="py-3 tabular-nums">{product.incomingStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>

      <DashboardSection
        title="Top products"
        description={`Ranked for ${period.year}-${String(period.month).padStart(2, "0")}`}
      >
        {data.topProducts.length === 0 ? (
          <DashboardEmpty message="No product sales in this period." />
        ) : (
          <>
            <HorizontalBarChart
              compact
              data={chartData}
              nameKey="name"
              valueKey="value"
              valueLabel={chartLabelForRank(rankBy)}
              valueFormatter={(value) => chartValueFormatter(rankBy, value)}
            />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[36rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-xs tracking-wide text-muted-foreground uppercase">
                    <th className="pb-3 pr-4 font-medium">Product</th>
                    <th className="pb-3 pr-4 font-medium">Units</th>
                    <th className="pb-3 pr-4 font-medium">Revenue</th>
                    <th className="pb-3 font-medium">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((row) => (
                    <tr key={row.productId} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4">
                        <ProductNameCell
                          href={`/admin/products/${row.productId}`}
                          imageUrl={row.imageUrl}
                          name={row.name}
                          sku={row.sku}
                        />
                      </td>
                      <td className="py-3 pr-4 tabular-nums">{row.unitsSold}</td>
                      <td className="py-3 pr-4 tabular-nums">{formatUsd(row.revenue)}</td>
                      <td className="py-3 tabular-nums">{formatUsd(row.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </DashboardSection>
    </div>
  )
}
