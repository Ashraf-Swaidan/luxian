"use client"

import Link from "next/link"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"

export function formatUsd(amount: number) {
  return formatPrice(amount)
}

export function customerLabel(customer: {
  email: string
  firstName: string | null
  lastName: string | null
}) {
  const name = [customer.firstName, customer.lastName].filter(Boolean).join(" ").trim()
  return name || customer.email
}

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function buildYearOptions() {
  const current = new Date().getFullYear()
  return Array.from({ length: 5 }, (_, index) => current - index)
}

export type MonthYearFilterValue = {
  year: number
  month: number
}

export function DashboardKpiCard({
  label,
  value,
  hint,
  className,
}: {
  label: string
  value: string
  hint?: string
  className?: string
}) {
  return (
    <div className={cn("bg-white p-5 ring-1 ring-border/60", className)}>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold tabular-nums text-neutral-950">{value}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  )
}

export function DashboardSection({
  title,
  description,
  children,
  action,
}: {
  title: string
  description?: string
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <section className="space-y-4 bg-white p-6 ring-1 ring-border/60">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-2xl font-bold uppercase text-neutral-950">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

export function MonthYearFilter({
  value,
  onChange,
  showAllTime,
}: {
  value: MonthYearFilterValue
  onChange: (value: MonthYearFilterValue) => void
  showAllTime?: boolean
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={String(value.year)}
        onValueChange={(year) => onChange({ ...value, year: Number(year) })}
      >
        <SelectTrigger className="h-9 w-[7rem]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {buildYearOptions().map((year) => (
            <SelectItem key={year} value={String(year)}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(value.month)}
        onValueChange={(month) => onChange({ ...value, month: Number(month) })}
      >
        <SelectTrigger className="h-9 w-[9rem]">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {MONTH_LABELS.map((label, index) => (
            <SelectItem key={label} value={String(index + 1)}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showAllTime && (
        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:underline"
          onClick={() => {
            const now = new Date()
            onChange({ year: now.getFullYear(), month: now.getMonth() + 1 })
          }}
        >
          Current month
        </button>
      )}
    </div>
  )
}

export function DashboardLoading({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-32 w-full" />
      ))}
    </div>
  )
}

export function DashboardEmpty({ message }: { message: string }) {
  return <p className="text-sm text-muted-foreground">{message}</p>
}

export function ViewAllLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-sm font-medium text-neutral-950 underline-offset-4 hover:underline">
      {label}
    </Link>
  )
}

export function orderStatusClass(status: string) {
  switch (status) {
    case "PROCESSING":
      return "bg-amber-100 text-amber-950"
    case "SHIPPED":
      return "bg-sky-100 text-sky-950"
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-950"
    case "CANCELLED":
      return "bg-neutral-200 text-neutral-700"
    default:
      return "bg-neutral-100 text-neutral-800"
  }
}
