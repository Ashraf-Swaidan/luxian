import Link from "next/link"

import { LineItemThumb } from "@/components/common/line-item-thumb"
import { formatPrice } from "@/lib/format-price"
import { cn } from "@/lib/utils"

type OrderLineRowProps = {
  productId: string
  name: string
  imageUrl?: string | null
  quantity: number
  lineTotal: number | string
  unitPrice?: number | string
  className?: string
}

export function OrderLineRow({
  productId,
  name,
  imageUrl,
  quantity,
  lineTotal,
  unitPrice,
  className,
}: OrderLineRowProps) {
  return (
    <div className={cn("flex gap-4 py-3 first:pt-0 last:pb-0", className)}>
      <LineItemThumb productId={productId} name={name} imageUrl={imageUrl} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
        <Link
          href={`/products/${productId}`}
          className="font-medium leading-snug hover:text-[var(--luxian-teal)]"
        >
          {name}
        </Link>
        <p className="text-sm text-muted-foreground">
          Qty {quantity}
          {unitPrice !== undefined && ` · ${formatPrice(unitPrice)} each`}
        </p>
      </div>
      <p className="shrink-0 self-center text-sm font-medium tabular-nums">
        {formatPrice(lineTotal)}
      </p>
    </div>
  )
}
