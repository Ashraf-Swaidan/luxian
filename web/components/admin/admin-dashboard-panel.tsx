"use client"

import { useMemo, useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { hasPermission } from "@/lib/permissions"
import { PERMISSIONS } from "@/lib/permissions"
import type { Permission } from "@/lib/types/auth"
import { useAuth } from "@/providers/auth-provider"

import { CustomersTab } from "./dashboard/customers-tab"
import { HomeTab } from "./dashboard/home-tab"
import { OrdersTab } from "./dashboard/orders-tab"
import { ProductsTab } from "./dashboard/products-tab"
import { SalesTab } from "./dashboard/sales-tab"
import { SuppliersTab } from "./dashboard/suppliers-tab"

const TABS = [
  { id: "home", label: "Home", permission: PERMISSIONS.DASHBOARD_READ },
  { id: "sales", label: "Sales", permission: PERMISSIONS.DASHBOARD_READ },
  { id: "orders", label: "Orders", permission: PERMISSIONS.ORDERS_READ },
  { id: "products", label: "Products", permission: PERMISSIONS.PRODUCTS_READ },
  { id: "customers", label: "Customers", permission: PERMISSIONS.DASHBOARD_READ },
  { id: "suppliers", label: "Suppliers", permission: PERMISSIONS.SUPPLIERS_READ },
] as const

type DashboardTabId = (typeof TABS)[number]["id"]

export function AdminDashboardPanel() {
  const { user } = useAuth()
  const visibleTabs = useMemo(
    () => TABS.filter((tab) => hasPermission(user, tab.permission as Permission)),
    [user],
  )
  const defaultTab = visibleTabs[0]?.id ?? "home"
  const [activeTab, setActiveTab] = useState<DashboardTabId>(defaultTab)
  const [mountedTabs, setMountedTabs] = useState<Set<DashboardTabId>>(new Set([defaultTab]))

  const handleTabChange = (value: string) => {
    const tab = value as DashboardTabId
    setActiveTab(tab)
    setMountedTabs((current) => new Set(current).add(tab))
  }

  if (visibleTabs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">You do not have permission to view dashboard insights.</p>
    )
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Insights</p>
        <h2 className="font-display text-4xl font-bold uppercase text-neutral-950 sm:text-5xl">Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          Revenue, profit, orders, products, customers, and supplier performance.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-4 border-b border-border/60 pb-0">
          {visibleTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="px-0 pb-3">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="home" className="mt-6">
          {mountedTabs.has("home") && <HomeTab />}
        </TabsContent>
        <TabsContent value="sales" className="mt-6">
          {mountedTabs.has("sales") && <SalesTab />}
        </TabsContent>
        <TabsContent value="orders" className="mt-6">
          {mountedTabs.has("orders") && <OrdersTab />}
        </TabsContent>
        <TabsContent value="products" className="mt-6">
          {mountedTabs.has("products") && <ProductsTab />}
        </TabsContent>
        <TabsContent value="customers" className="mt-6">
          {mountedTabs.has("customers") && <CustomersTab />}
        </TabsContent>
        <TabsContent value="suppliers" className="mt-6">
          {mountedTabs.has("suppliers") && <SuppliersTab />}
        </TabsContent>
      </Tabs>
    </div>
  )
}
