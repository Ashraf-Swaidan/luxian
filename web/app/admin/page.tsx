import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Link href="/admin/categories">
        <Card className="transition-colors hover:bg-muted/30">
          <CardHeader>
            <CardTitle>Categories</CardTitle>
            <CardDescription>Create and manage product categories.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            POST / PATCH / DELETE (deactivate)
          </CardContent>
        </Card>
      </Link>
      <Link href="/admin/products">
        <Card className="transition-colors hover:bg-muted/30">
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Add inventory and pricing for the catalog.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Linked to categories · visible on /products when active
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
