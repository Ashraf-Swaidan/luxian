"use client"

import {
  BadgeDollarSignIcon,
  Calendar03Icon,
  MultiplicationSignCircleIcon,
  PackageIcon,
  ShoppingBag01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { useMemo, useState } from "react"

import { EmptyState } from "@/components/common/empty-state"
import { LineItemThumb } from "@/components/common/line-item-thumb"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrders } from "@/features/orders/hooks"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"
import type { Order, OrderStatus } from "@/lib/types/order"

const PAGE_SIZE = 5

type OrderSort = "newest" | "oldest" | "price-high" | "price-low"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function toDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function statusLabel(status: OrderStatus) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function OrderRow({ order }: { order: Order }) {
  const previewItems = order.orderItems.slice(0, 4)
  const overflowCount = order.orderItems.length - previewItems.length

  return (
    <Link
      href={`/account/orders/${order.id}`}
      className="group relative grid gap-5 bg-white p-5 ring-1 ring-border/50 transition-colors hover:bg-neutral-50 md:grid-cols-[minmax(0,1fr)_11rem] md:items-center"
    >
      <p className="absolute right-4 top-4 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        #{order.orderNumber}
      </p>

      <div className="min-w-0 space-y-4 pr-16">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-4xl font-bold uppercase leading-none text-neutral-950">
              Order
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {order.orderItems.length} item{order.orderItems.length === 1 ? "" : "s"} in this
            purchase
          </p>
        </div>

        <div className="flex items-center">
          {previewItems.map((item, index) => (
            <div
              key={item.id}
              className={cn("relative ring-2 ring-white", index > 0 && "-ml-2")}
              style={{ zIndex: previewItems.length - index }}
            >
              <LineItemThumb
                name={item.product?.name ?? "Product"}
                imageUrl={item.product?.imageUrl}
                size="sm"
              />
            </div>
          ))}
          {overflowCount > 0 && (
            <div
              className="relative z-0 -ml-2 flex size-12 items-center justify-center bg-muted text-xs font-medium text-muted-foreground ring-2 ring-white"
              aria-label={`${overflowCount} more items`}
            >
              +{overflowCount}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-border/60 pt-4 md:block md:border-t-0 md:pt-0 md:text-right">
        <p className="font-display text-3xl font-bold leading-none text-neutral-950">
          {formatPrice(order.totalAmount)}
        </p>
        <span className="mt-3 inline-flex bg-[oklch(0.92_0.08_180)] px-3 py-1 text-xs font-medium uppercase tracking-wide text-neutral-950">
          {statusLabel(order.status)}
        </span>
      </div>
    </Link>
  )
}

export function OrdersList() {
  const { data: orders, isPending, isError } = useOrders()
  const [sort, setSort] = useState<OrderSort>("newest")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [dateOpen, setDateOpen] = useState(false)
  const [page, setPage] = useState(1)

  const filteredOrders = useMemo(() => {
    const selectedKey = selectedDate ? toDateKey(selectedDate) : null
    const filtered = (orders ?? []).filter((order) => {
      if (!selectedKey) {
        return true
      }
      return toDateKey(new Date(order.createdAt)) === selectedKey
    })

    return [...filtered].sort((left, right) => {
      if (sort === "oldest") {
        return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      }
      if (sort === "price-high") {
        return Number(right.totalAmount) - Number(left.totalAmount)
      }
      if (sort === "price-low") {
        return Number(left.totalAmount) - Number(right.totalAmount)
      }
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })
  }, [orders, selectedDate, sort])

  if (isPending) {
    return (
      <div className="w-full space-y-8">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-52 w-full" />
        <Skeleton className="h-52 w-full" />
      </div>
    )
  }

  if (isError) {
    return <p className="text-sm text-destructive">Could not load your orders.</p>
  }

  if (!orders?.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="When you complete checkout, your orders will appear here."
        actionLabel="Start shopping"
        actionHref="/products"
      />
    )
  }

  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
  const totalItems = orders.reduce((sum, order) => sum + order.orderItems.length, 0)
  const latestOrder = [...orders].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )[0]
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageStart = (currentPage - 1) * PAGE_SIZE
  const visibleOrders = filteredOrders.slice(pageStart, pageStart + PAGE_SIZE)
  const hasFilters = Boolean(selectedDate) || sort !== "newest"

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <OrderWidget
          icon={PackageIcon}
          label="You've made"
          value={`${totalOrders} order${totalOrders === 1 ? "" : "s"}`}
          tone="bg-[oklch(0.91_0.11_185)]"
        />
        <OrderWidget
          icon={BadgeDollarSignIcon}
          label="Total spent"
          value={formatPrice(totalSpent)}
          tone="bg-[oklch(0.9_0.12_86)]"
        />
        <OrderWidget
          icon={Calendar03Icon}
          label="Latest order"
          value={latestOrder ? formatDate(latestOrder.createdAt) : "Not yet"}
          tone="bg-[oklch(0.92_0.08_330)]"
        />
        <OrderWidget
          icon={ShoppingBag01Icon}
          label="Items purchased"
          value={`${totalItems} item${totalItems === 1 ? "" : "s"}`}
          tone="bg-[oklch(0.9_0.08_250)]"
        />
      </div>

      <div className="grid gap-4 bg-white p-4 ring-1 ring-border/50 lg:grid-cols-[auto_minmax(13rem,16rem)_1fr] lg:items-end">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Search by date
          </p>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex h-10 items-center gap-2 bg-muted px-3 text-sm font-medium text-neutral-950 transition-colors hover:bg-muted/70"
              >
                <HugeiconsIcon icon={Calendar03Icon} className="size-4" strokeWidth={1.8} />
                {selectedDate ? formatDate(selectedDate.toISOString()) : "Choose date"}
              </button>
            </PopoverTrigger>
            <PopoverContent align="start">
              <Calendar
                mode="single"
                selected={selectedDate ?? undefined}
                onSelect={(date) => {
                  if (!date) {
                    return
                  }
                  setSelectedDate(date)
                  setDateOpen(false)
                  setPage(1)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sort orders
          </p>
          <Select
            value={sort}
            onValueChange={(value) => {
              setSort(value as OrderSort)
              setPage(1)
            }}
          >
            <SelectTrigger className="h-10 w-full border-x-0 border-t-0 bg-transparent px-0 focus-visible:ring-0">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest first</SelectItem>
              <SelectItem value="oldest">Oldest first</SelectItem>
              <SelectItem value="price-high">Highest price</SelectItem>
              <SelectItem value="price-low">Lowest price</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            className="justify-self-start lg:justify-self-end"
            onClick={() => {
              setSelectedDate(null)
              setSort("newest")
              setPage(1)
            }}
          >
            <HugeiconsIcon
              icon={MultiplicationSignCircleIcon}
              className="size-4"
              strokeWidth={1.8}
            />
            Clear filters
          </Button>
        )}
      </div>

      {visibleOrders.length ? (
        <ul className="space-y-4">
          {visibleOrders.map((order) => (
            <li key={order.id}>
              <OrderRow order={order} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-start gap-3 border border-dashed border-border/60 bg-muted/20 px-6 py-10">
          <p className="font-medium">No orders on that date</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Try another date or clear the filters.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSort("newest")
              setSelectedDate(null)
              setPage(1)
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {filteredOrders.length > PAGE_SIZE && (
        <div className="flex flex-col gap-3 border-t border-border/60 pt-5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            Showing {pageStart + 1}-{Math.min(pageStart + PAGE_SIZE, filteredOrders.length)} of{" "}
            {filteredOrders.length}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={currentPage <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((value) => value + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function OrderWidget({
  icon,
  label,
  tone,
  value,
}: {
  icon: Parameters<typeof HugeiconsIcon>[0]["icon"]
  label: string
  tone: string
  value: string
}) {
  return (
    <div className={cn("flex min-h-32 flex-col justify-between p-4 text-neutral-950", tone)}>
      <HugeiconsIcon icon={icon} className="size-7" strokeWidth={1.7} />
      <div>
        <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
        <p className="mt-1 font-display text-3xl font-bold uppercase leading-none">{value}</p>
      </div>
    </div>
  )
}
