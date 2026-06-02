"use client"

import { useState } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { CustomersTab } from "./dashboard/customers-tab"
import { HomeTab } from "./dashboard/home-tab"
import { OrdersTab } from "./dashboard/orders-tab"
import { ProductsTab } from "./dashboard/products-tab"
import { SalesTab } from "./dashboard/sales-tab"
import { SuppliersTab } from "./dashboard/suppliers-tab"

const TABS = [
  { id: "home", label: "Home" },
  { id: "sales", label: "Sales" },
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "customers", label: "Customers" },
  { id: "suppliers", label: "Suppliers" },
] as const

type DashboardTabId = (typeof TABS)[number]["id"]

export function AdminDashboardPanel() {
  const [activeTab, setActiveTab] = useState<DashboardTabId>("home")
  const [mountedTabs, setMountedTabs] = useState<Set<DashboardTabId>>(new Set(["home"]))

  const handleTabChange = (value: string) => {
    const tab = value as DashboardTabId
    setActiveTab(tab)
    setMountedTabs((current) => new Set(current).add(tab))
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
          {TABS.map((tab) => (
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
