import { ProductsGrid } from "@/components/products-grid"
import { StorePage } from "@/components/store-page"

export default function ProductsPage() {
  return (
    <StorePage
      title="Shop"
      description="Browse the collection. Sign in to save items to your bag."
    >
      <ProductsGrid />
    </StorePage>
  )
}
