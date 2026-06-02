"use client"

import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getStatsSales } from "@/features/stats/api"
import { queryKeys } from "@/lib/query-keys"
import type { SalesGranularity } from "@/lib/types/stats"
import { cn } from "@/lib/utils"

import { RevenueProfitAreaChart } from "./dashboard-charts"
import {
  DashboardKpiCard,
  DashboardLoading,
  DashboardSection,
  formatUsd,
  MonthYearFilter,
  type MonthYearFilterValue,
} from "./dashboard-shared"

const GRANULARITIES: SalesGranularity[] = ["daily", "monthly", "yearly"]

export function SalesTab() {
  const now = new Date()
  const [granularity, setGranularity] = useState<SalesGranularity>("daily")
  const [period, setPeriod] = useState<MonthYearFilterValue>({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  const { data, isPending, isError } = useQuery({
    queryKey: queryKeys.stats.sales({ granularity, year: period.year, month: period.month }),
    queryFn: () => getStatsSales({ granularity, year: period.year, month: period.month }),
  })

  if (isPending) {
    return <DashboardLoading rows={3} />
  }

  if (isError || !data) {
    return <p className="text-sm text-destructive">Could not load sales insights.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex gap-1 border border-border/60 p-1">
          {GRANULARITIES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setGranularity(option)}
              className={cn(
                "px-3 py-1.5 text-sm font-medium capitalize transition-colors",
                granularity === option
                  ? "bg-neutral-950 text-white"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option}
            </button>
          ))}
        </div>
        <MonthYearFilter value={period} onChange={setPeriod} showAllTime />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardKpiCard
          label="Today"
          value={formatUsd(data.today.revenue)}
          hint={`Profit ${formatUsd(data.today.profit)}`}
        />
        <DashboardKpiCard
          label="This month"
          value={formatUsd(data.thisMonth.revenue)}
          hint={`Profit ${formatUsd(data.thisMonth.profit)}`}
        />
        <DashboardKpiCard
          label={`${period.year}-${String(period.month).padStart(2, "0")}`}
          value={formatUsd(data.selectedMonth.revenue)}
          hint={`Profit ${formatUsd(data.selectedMonth.profit)}`}
        />
      </div>

      <DashboardSection
        title="Revenue and profit"
        description={`Trend by ${granularity} period`}
      >
        <RevenueProfitAreaChart data={data.trend} className="aspect-[2.6/1] w-full min-h-[300px]" />
      </DashboardSection>
    </div>
  )
}
