"use client"

import Link from "next/link"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { SuppliersHome } from "@/components/admin/suppliers/suppliers-home"
import { SupplierOrdersView } from "@/components/admin/suppliers/supplier-orders-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminSuppliersPanel() {
  return (
    <Tabs defaultValue="home" className="gap-4">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/admin"
          className="inline-flex shrink-0 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={1.8} />
          <span className="sm:hidden">Back</span>
          <span className="hidden sm:inline">Back to overview</span>
        </Link>
        <TabsList className="min-w-0 shrink overflow-x-auto">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="home">
        <SuppliersHome />
      </TabsContent>

      <TabsContent value="orders">
        <SupplierOrdersView />
      </TabsContent>
    </Tabs>
  )
}
