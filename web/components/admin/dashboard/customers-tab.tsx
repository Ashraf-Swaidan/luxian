"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getStatsCustomers } from "@/features/stats/api"
import { queryKeys } from "@/lib/query-keys"

import { CountLineChart } from "./dashboard-charts"
import {
  customerLabel,
  DashboardEmpty,
  DashboardLoading,
  DashboardSection,
  formatUsd,
  MonthYearFilter,
  type MonthYearFilterValue,
} from "./dashboard-shared"

export function CustomersTab() {
  const now = new Date()
  const [period, setPeriod] = useState<MonthYearFilterValue>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.stats.customers({ year: period.year, month: period.month }),
    queryFn: () => getStatsCustomers({ year: period.year, month: period.month }),
  })

  if (isPending) {
    return <DashboardLoading rows={3} />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Could not load customer insights.</p>
  }

  return (
    <div className="space-y-6">
      <MonthYearFilter value={period} onChange={setPeriod} showAllTime />

      <DashboardSection
        title="Top customers"
        description={`By spend for ${period.year}-${String(period.month).padStart(2, "0")}`}
      >
        {data.topCustomers.length === 0 ? (
          <DashboardEmpty message="No customer orders in this period." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs tracking-wide text-muted-foreground uppercase">
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">Orders</th>
                  <th className="pb-3 font-medium">Total spent</th>
                </tr>
              </thead>
              <tbody>
                {data.topCustomers.map((customer) => (
                  <tr key={customer.userId} className="border-b border-border/40 last:border-0">
                    <td className="py-3 pr-4 font-medium">{customerLabel(customer)}</td>
                    <td className="py-3 pr-4 text-muted-foreground">{customer.email}</td>
                    <td className="py-3 pr-4 tabular-nums">{customer.orderCount}</td>
                    <td className="py-3 tabular-nums">{formatUsd(customer.totalSpent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DashboardSection>

      <DashboardSection title="New customers" description="Registrations over the last 12 months">
        <CountLineChart
          data={data.newCustomersOverTime.map((row) => ({ date: row.month, count: row.count }))}
          label="New customers"
        />
      </DashboardSection>
    </div>
  )
}
