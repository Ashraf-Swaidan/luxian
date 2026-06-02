CREATE TYPE "SupplierOrderStatus" AS ENUM ('ON_THE_WAY', 'RECEIVED', 'CANCELLED');
CREATE TYPE "StockMovementType" AS ENUM ('SUPPLIER_RECEIVED', 'CUSTOMER_ORDER', 'ORDER_RESTOCK');

ALTER TABLE "products" ADD COLUMN "cost" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "order_items" ADD COLUMN "costAtSale" DECIMAL(10,2) NOT NULL DEFAULT 0;

CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "supplier_orders" (
    "id" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "status" "SupplierOrderStatus" NOT NULL DEFAULT 'ON_THE_WAY',
    "notes" TEXT,
    "supplierId" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "supplier_order_items" (
    "id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCost" DECIMAL(10,2) NOT NULL,
    "supplierOrderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supplier_order_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantityDelta" INTEGER NOT NULL,
    "note" TEXT,
    "productId" TEXT NOT NULL,
    "orderId" TEXT,
    "supplierOrderId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "suppliers_isActive_idx" ON "suppliers"("isActive");
CREATE UNIQUE INDEX "supplier_orders_orderNumber_key" ON "supplier_orders"("orderNumber");
CREATE INDEX "supplier_orders_supplierId_idx" ON "supplier_orders"("supplierId");
CREATE INDEX "supplier_orders_status_idx" ON "supplier_orders"("status");
CREATE INDEX "supplier_orders_createdAt_idx" ON "supplier_orders"("createdAt");
CREATE INDEX "supplier_order_items_supplierOrderId_idx" ON "supplier_order_items"("supplierOrderId");
CREATE INDEX "supplier_order_items_productId_idx" ON "supplier_order_items"("productId");
CREATE INDEX "stock_movements_productId_createdAt_idx" ON "stock_movements"("productId", "createdAt");
CREATE INDEX "stock_movements_type_createdAt_idx" ON "stock_movements"("type", "createdAt");
CREATE INDEX "stock_movements_orderId_idx" ON "stock_movements"("orderId");
CREATE INDEX "stock_movements_supplierOrderId_idx" ON "stock_movements"("supplierOrderId");

ALTER TABLE "supplier_orders" ADD CONSTRAINT "supplier_orders_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "supplier_order_items" ADD CONSTRAINT "supplier_order_items_supplierOrderId_fkey" FOREIGN KEY ("supplierOrderId") REFERENCES "supplier_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "supplier_order_items" ADD CONSTRAINT "supplier_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_supplierOrderId_fkey" FOREIGN KEY ("supplierOrderId") REFERENCES "supplier_orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
