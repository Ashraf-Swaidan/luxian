"use client"

import { SuppliersHome } from "@/components/admin/suppliers/suppliers-home"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AdminSuppliersPanel() {
  return (
    <Tabs defaultValue="home" className="space-y-8">
      <TabsList>
        <TabsTrigger value="home">Home</TabsTrigger>
        <TabsTrigger value="orders">Orders</TabsTrigger>
      </TabsList>

      <TabsContent value="home">
        <SuppliersHome />
      </TabsContent>

      <TabsContent value="orders">
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">Supplier orders UI coming soon.</p>
        </div>
      </TabsContent>
    </Tabs>
  )
}
