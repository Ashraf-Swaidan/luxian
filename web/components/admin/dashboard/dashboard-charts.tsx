"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import type { RevenueProfitPoint, StatusCount } from "@/lib/types/stats"

import { formatUsd } from "./dashboard-shared"

const revenueProfitConfig = {
  revenue: { label: "Revenue", color: "oklch(0.55 0.12 195)" },
  profit: { label: "Profit", color: "oklch(0.72 0.14 145)" },
} satisfies ChartConfig

const statusColors: Record<string, string> = {
  PROCESSING: "oklch(0.82 0.14 85)",
  SHIPPED: "oklch(0.72 0.14 195)",
  DELIVERED: "oklch(0.7 0.12 145)",
  CANCELLED: "oklch(0.75 0.02 260)",
  PENDING: "oklch(0.85 0.08 330)",
}

export function RevenueProfitAreaChart({
  data,
  className,
}: {
  data: RevenueProfitPoint[]
  className?: string
}) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No sales data for this period.</p>
  }

  return (
    <ChartContainer config={revenueProfitConfig} className={className ?? "aspect-[2.4/1] w-full min-h-[240px]"}>
      <AreaChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatUsd(Number(value))} width={72} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value, name) => [formatUsd(Number(value)), revenueProfitConfig[name as keyof typeof revenueProfitConfig]?.label ?? name]}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Area dataKey="revenue" type="monotone" fill="var(--color-revenue)" fillOpacity={0.25} stroke="var(--color-revenue)" strokeWidth={2} />
        <Area dataKey="profit" type="monotone" fill="var(--color-profit)" fillOpacity={0.2} stroke="var(--color-profit)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  )
}

export function StatusDonutChart({ data, className }: { data: StatusCount[]; className?: string }) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No orders yet.</p>
  }

  const chartData = data.map((row) => ({
    ...row,
    fill: statusColors[row.status] ?? "oklch(0.8 0.05 260)",
  }))

  const config = Object.fromEntries(
    chartData.map((row) => [row.status, { label: row.status }]),
  ) satisfies ChartConfig

  return (
    <ChartContainer config={config} className={className ?? "mx-auto aspect-square w-full max-w-[280px]"}>
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
        <Pie data={chartData} dataKey="count" nameKey="status" innerRadius={56} outerRadius={88} paddingAngle={2}>
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="status" />} />
      </PieChart>
    </ChartContainer>
  )
}

export function CountLineChart({
  data,
  dataKey = "count",
  label = "Count",
  className,
}: {
  data: { date: string; count: number }[]
  dataKey?: string
  label?: string
  className?: string
}) {
  const config = { [dataKey]: { label, color: "oklch(0.55 0.12 195)" } } satisfies ChartConfig

  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No data for this period.</p>
  }

  return (
    <ChartContainer config={config} className={className ?? "aspect-[2.2/1] w-full min-h-[220px]"}>
      <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={40} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line dataKey={dataKey} type="monotone" stroke={`var(--color-${dataKey})`} strokeWidth={2} dot={false} />
      </LineChart>
    </ChartContainer>
  )
}

export function HorizontalBarChart({
  data,
  nameKey,
  valueFormatter,
  valueKey,
  valueLabel,
  className,
  compact = false,
}: {
  data: Record<string, string | number>[]
  nameKey: string
  valueKey: string
  valueLabel: string
  valueFormatter?: (value: number) => string
  className?: string
  compact?: boolean
}) {
  const config = { [valueKey]: { label: valueLabel, color: "oklch(0.55 0.12 195)" } } satisfies ChartConfig

  if (!data.length) {
    return <p className="text-sm text-muted-foreground">No data for this period.</p>
  }

  return (
    <ChartContainer
      config={config}
      className={
        className ??
        (compact
          ? "aspect-[2.8/1] w-full min-h-[140px] max-h-[180px]"
          : "aspect-[1.6/1] w-full min-h-[260px]")
      }
    >
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 8, bottom: 0 }}>
        <CartesianGrid horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickFormatter={valueFormatter ? (value) => valueFormatter(Number(value)) : undefined}
        />
        <YAxis
          type="category"
          dataKey={nameKey}
          tickLine={false}
          axisLine={false}
          width={compact ? 96 : 120}
        />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => [
                valueFormatter ? valueFormatter(Number(value)) : value,
                valueLabel,
              ]}
            />
          }
        />
        <Bar dataKey={valueKey} fill={`var(--color-${valueKey})`} radius={4} />
      </BarChart>
    </ChartContainer>
  )
}

export function SpendingAreaChart({
  data,
  className,
}: {
  data: { month: string; spent: number }[]
  className?: string
}) {
  const chartData = data.map((row) => ({ date: row.month, spent: row.spent }))
  const config = { spent: { label: "Spent", color: "oklch(0.72 0.12 160)" } } satisfies ChartConfig

  if (!chartData.length) {
    return <p className="text-sm text-muted-foreground">No supplier spending yet.</p>
  }

  return (
    <ChartContainer config={config} className={className ?? "aspect-[2.2/1] w-full min-h-[220px]"}>
      <AreaChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => formatUsd(Number(value))} width={72} />
        <ChartTooltip
          content={
            <ChartTooltipContent formatter={(value) => [formatUsd(Number(value)), "Spent"]} />
          }
        />
        <Area dataKey="spent" type="monotone" fill="var(--color-spent)" fillOpacity={0.25} stroke="var(--color-spent)" strokeWidth={2} />
      </AreaChart>
    </ChartContainer>
  )
}
