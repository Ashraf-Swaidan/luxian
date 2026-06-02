"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"

import { getStatsProducts } from "@/features/stats/api"
import { queryKeys } from "@/lib/query-keys"

import { HorizontalBarChart } from "./dashboard-charts"
import {
  DashboardEmpty,
  DashboardLoading,
  DashboardSection,
  formatUsd,
  MonthYearFilter,
  type MonthYearFilterValue,
} from "./dashboard-shared"

export function ProductsTab() {
  const now = new Date()
  const [period, setPeriod] = useState<MonthYearFilterValue>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.stats.products({ year: period.year, month: period.month }),
    queryFn: () => getStatsProducts({ year: period.year, month: period.month }),
  })

  if (isPending) {
    return <DashboardLoading rows={3} />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Could not load product insights.</p>
  }

  return (
    <div className="space-y-6">
      <MonthYearFilter value={period} onChange={setPeriod} showAllTime />

      <DashboardSection
        title="Needs restock"
        description="Active products at or below their restock limit"
      >
        {data.needingRestock.length === 0 ? (
          <DashboardEmpty message="All active products are above their restock limits." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-3 pr-4 font-medium">Product</th>
                  <th className="pb-3 pr-4 font-medium">SKU</th>
                  <th className="pb-3 pr-4 font-medium">Stock</th>
                  <th className="pb-3 pr-4 font-medium">Limit</th>
                  <th className="pb-3 font-medium">Incoming</th>
                </tr>
              </thead>
              <tbody>
                {data.needingRestock.map((product) => (
                  <tr key={product.id} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pr-4">
                      <Link href={`/admin/products/${product.id}`} className="font-medium hover:underline">
                        {product.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{product.sku}</td>
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
        description={`Best sellers for ${period.year}-${String(period.month).padStart(2, "0")}`}
      >
        <HorizontalBarChart
          data={data.topProducts.map((row) => ({
            name: row.name,
            unitsSold: row.unitsSold,
          }))}
          nameKey="name"
          valueKey="unitsSold"
          valueLabel="Units sold"
        />
        {data.topProducts.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
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
                      <Link href={`/admin/products/${row.productId}`} className="font-medium hover:underline">
                        {row.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 tabular-nums">{row.unitsSold}</td>
                    <td className="py-3 pr-4 tabular-nums">{formatUsd(row.revenue)}</td>
                    <td className="py-3 tabular-nums">{formatUsd(row.profit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>
    </div>
  )
}
