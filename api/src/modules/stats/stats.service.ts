import { Injectable } from '@nestjs/common';
import { OrderStatus, Prisma, SupplierOrderStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SalesStatsQueryDto, StatsQueryDto } from './dto/stats-query.dto';
import { rankItems, type StatsRankBy } from './stats-ranking';
import {
  ACTIVE_ORDER_WHERE,
  currentYearMonth,
  endOfDay,
  endOfMonth,
  formatDateKey,
  formatMonthKey,
  resolveYearMonth,
  startOfDay,
  startOfMonth,
  toNumber,
} from './stats.utils';

function resolveRankBy(rankBy?: StatsRankBy): StatsRankBy {
  return rankBy ?? 'balanced';
}

const adminOrderSummaryInclude = {
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  },
  orderItems: {
    include: { product: true },
    orderBy: { product: { name: 'asc' as const } },
  },
  payment: true,
} satisfies Prisma.OrderInclude;

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const { year, month } = currentYearMonth();
    const monthStart = startOfMonth(year, month);
    const monthEnd = endOfMonth(year, month);
    const sparklineStart = new Date(todayStart);
    sparklineStart.setDate(sparklineStart.getDate() - 6);

    const [
      todayRevenue,
      todayProfit,
      monthRevenue,
      monthProfit,
      ordersThisMonth,
      ordersProcessing,
      productsNeedingRestock,
      openSupplierOrders,
      byStatus,
      revenueSparkline,
      recentOrders,
    ] = await Promise.all([
      this.sumOrderRevenue({ createdAt: { gte: todayStart, lte: todayEnd } }),
      this.sumOrderProfit({ from: todayStart, to: todayEnd }),
      this.sumOrderRevenue({ createdAt: { gte: monthStart, lte: monthEnd } }),
      this.sumOrderProfit({ from: monthStart, to: monthEnd }),
      this.prisma.order.count({
        where: { ...ACTIVE_ORDER_WHERE, createdAt: { gte: monthStart, lte: monthEnd } },
      }),
      this.prisma.order.count({ where: { status: OrderStatus.PROCESSING } }),
      this.countProductsNeedingRestock(),
      this.prisma.supplierOrder.count({ where: { status: SupplierOrderStatus.ON_THE_WAY } }),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.getRevenueProfitTrend(sparklineStart, todayEnd, 'daily'),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: adminOrderSummaryInclude,
      }),
    ]);

    return {
      todayRevenue,
      todayProfit,
      monthRevenue,
      monthProfit,
      ordersThisMonth,
      ordersProcessing,
      productsNeedingRestock,
      openSupplierOrders,
      byStatus: byStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      revenueSparkline,
      recentOrders: recentOrders.map((order) => this.serializeOrder(order)),
    };
  }

  async getSales(query: SalesStatsQueryDto) {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const { year, month } = currentYearMonth();
    const thisMonthStart = startOfMonth(year, month);
    const thisMonthEnd = endOfMonth(year, month);
    const selected = resolveYearMonth(query.year, query.month);
    const selectedStart = startOfMonth(selected.year, selected.month);
    const selectedEnd = endOfMonth(selected.year, selected.month);
    const granularity = query.granularity ?? 'daily';

    let trendFrom: Date;
    const trendTo = todayEnd;

    if (granularity === 'yearly') {
      trendFrom = new Date(2000, 0, 1);
    } else if (granularity === 'monthly') {
      trendFrom = new Date(now);
      trendFrom.setMonth(trendFrom.getMonth() - 11);
      trendFrom.setDate(1);
      trendFrom.setHours(0, 0, 0, 0);
    } else {
      trendFrom = new Date(todayStart);
      trendFrom.setDate(trendFrom.getDate() - 29);
    }

    const [trend, today, thisMonth, selectedMonth] = await Promise.all([
      this.getRevenueProfitTrend(trendFrom, trendTo, granularity),
      this.getPeriodTotals(todayStart, todayEnd),
      this.getPeriodTotals(thisMonthStart, thisMonthEnd),
      this.getPeriodTotals(selectedStart, selectedEnd),
    ]);

    return { trend, today, thisMonth, selectedMonth };
  }

  async getOrders(query: StatsQueryDto) {
    const now = new Date();
    const trendFrom = new Date(now);
    trendFrom.setMonth(trendFrom.getMonth() - 11);
    trendFrom.setDate(1);
    trendFrom.setHours(0, 0, 0, 0);

    const [
      byStatus,
      overTime,
      averageOrderValue,
      topCollections,
      topCategories,
      recentOrders,
    ] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.getOrdersOverTime(trendFrom, now),
      this.getAverageOrderValue(),
      this.getTopCollections(resolveRankBy(query.rankBy)),
      this.getTopCategories(resolveRankBy(query.rankBy)),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: adminOrderSummaryInclude,
      }),
    ]);

    return {
      byStatus: byStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      overTime,
      averageOrderValue,
      topCollections,
      topCategories,
      recentOrders: recentOrders.map((order) => this.serializeOrder(order)),
    };
  }

  async getProducts(query: StatsQueryDto) {
    const selected = resolveYearMonth(query.year, query.month);
    const periodStart = startOfMonth(selected.year, selected.month);
    const periodEnd = endOfMonth(selected.year, selected.month);

    const [needingRestock, topProducts] = await Promise.all([
      this.getProductsNeedingRestock(),
      this.getTopProducts(periodStart, periodEnd, resolveRankBy(query.rankBy)),
    ]);

    return { needingRestock, topProducts };
  }

  async getCustomers(query: StatsQueryDto) {
    const now = new Date();
    const trendFrom = new Date(now);
    trendFrom.setMonth(trendFrom.getMonth() - 11);
    trendFrom.setDate(1);
    trendFrom.setHours(0, 0, 0, 0);

    const selected = resolveYearMonth(query.year, query.month);
    const periodStart = startOfMonth(selected.year, selected.month);
    const periodEnd = endOfMonth(selected.year, selected.month);

    const [topCustomers, newCustomersOverTime] = await Promise.all([
      this.getTopCustomers(periodStart, periodEnd, resolveRankBy(query.rankBy)),
      this.getNewCustomersOverTime(trendFrom, now),
    ]);

    return { topCustomers, newCustomersOverTime };
  }

  async getSuppliers(query: StatsQueryDto = {}) {
    const now = new Date();
    const trendFrom = new Date(now);
    trendFrom.setMonth(trendFrom.getMonth() - 11);
    trendFrom.setDate(1);
    trendFrom.setHours(0, 0, 0, 0);

    const [
      spendingTrend,
      topSuppliers,
      byStatus,
      openOrdersCount,
      itemsOnTheWay,
    ] = await Promise.all([
      this.getSupplierSpendingTrend(trendFrom, now),
      this.getTopSuppliers(resolveRankBy(query.rankBy)),
      this.prisma.supplierOrder.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.supplierOrder.count({
        where: { status: SupplierOrderStatus.ON_THE_WAY },
      }),
      this.prisma.supplierOrderItem.aggregate({
        where: { supplierOrder: { status: SupplierOrderStatus.ON_THE_WAY } },
        _sum: { quantity: true },
      }),
    ]);

    return {
      spendingTrend,
      topSuppliers,
      byStatus: byStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      openOrdersCount,
      itemsOnTheWay: itemsOnTheWay._sum.quantity ?? 0,
    };
  }

  private async sumOrderRevenue(where: Prisma.OrderWhereInput) {
    const result = await this.prisma.order.aggregate({
      where: { ...ACTIVE_ORDER_WHERE, ...where },
      _sum: { totalAmount: true },
    });
    return toNumber(result._sum.totalAmount);
  }

  private async sumOrderProfit(range?: { from: Date; to: Date }) {
    const rows = range
      ? await this.prisma.$queryRaw<{ profit: unknown }[]>`
          SELECT COALESCE(SUM((oi.price - oi."costAtSale") * oi.quantity), 0) AS profit
          FROM order_items oi
          INNER JOIN orders o ON o.id = oi."orderId"
          WHERE o.status != 'CANCELLED'
            AND o."createdAt" >= ${range.from}
            AND o."createdAt" <= ${range.to}
        `
      : await this.prisma.$queryRaw<{ profit: unknown }[]>`
          SELECT COALESCE(SUM((oi.price - oi."costAtSale") * oi.quantity), 0) AS profit
          FROM order_items oi
          INNER JOIN orders o ON o.id = oi."orderId"
          WHERE o.status != 'CANCELLED'
        `;
    return toNumber(rows[0]?.profit);
  }

  private async getPeriodTotals(from: Date, to: Date) {
    const [revenue, profit] = await Promise.all([
      this.sumOrderRevenue({ createdAt: { gte: from, lte: to } }),
      this.sumOrderProfit({ from, to }),
    ]);
    return { revenue, profit };
  }

  private async getRevenueProfitTrend(
    from: Date,
    to: Date,
    granularity: 'daily' | 'monthly' | 'yearly',
  ) {
    const trunc =
      granularity === 'yearly'
        ? 'year'
        : granularity === 'monthly'
          ? 'month'
          : 'day';

    const rows = await this.prisma.$queryRaw<
      { bucket: Date; revenue: unknown; profit: unknown }[]
    >`
      WITH revenue_by_bucket AS (
        SELECT DATE_TRUNC(${trunc}, o."createdAt") AS bucket, SUM(o."totalAmount") AS revenue
        FROM orders o
        WHERE o.status != 'CANCELLED'
          AND o."createdAt" >= ${from}
          AND o."createdAt" <= ${to}
        GROUP BY bucket
      ),
      profit_by_bucket AS (
        SELECT DATE_TRUNC(${trunc}, o."createdAt") AS bucket,
          SUM((oi.price - oi."costAtSale") * oi.quantity) AS profit
        FROM order_items oi
        INNER JOIN orders o ON o.id = oi."orderId"
        WHERE o.status != 'CANCELLED'
          AND o."createdAt" >= ${from}
          AND o."createdAt" <= ${to}
        GROUP BY bucket
      )
      SELECT
        COALESCE(r.bucket, p.bucket) AS bucket,
        COALESCE(r.revenue, 0) AS revenue,
        COALESCE(p.profit, 0) AS profit
      FROM revenue_by_bucket r
      FULL OUTER JOIN profit_by_bucket p ON r.bucket = p.bucket
      ORDER BY bucket ASC
    `;

    return rows.map((row) => ({
      date:
        granularity === 'daily'
          ? formatDateKey(row.bucket)
          : granularity === 'monthly'
            ? formatMonthKey(row.bucket)
            : String(row.bucket.getFullYear()),
      revenue: toNumber(row.revenue),
      profit: toNumber(row.profit),
    }));
  }

  private async getOrdersOverTime(from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<{ bucket: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('month', o."createdAt") AS bucket, COUNT(*)::bigint AS count
      FROM orders o
      WHERE o.status != 'CANCELLED'
        AND o."createdAt" >= ${from}
        AND o."createdAt" <= ${to}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    return rows.map((row) => ({
      date: formatMonthKey(row.bucket),
      count: Number(row.count),
    }));
  }

  private async getAverageOrderValue() {
    const result = await this.prisma.order.aggregate({
      where: ACTIVE_ORDER_WHERE,
      _avg: { totalAmount: true },
    });
    return toNumber(result._avg.totalAmount);
  }

  private async getTopCollections(rankBy: StatsRankBy) {
    const rows = await this.prisma.$queryRaw<
      {
        collectionId: string;
        name: string;
        unitsSold: bigint;
        revenue: unknown;
        profit: unknown;
      }[]
    >`
      SELECT
        c.id AS "collectionId",
        c.name,
        COALESCE(SUM(oi.quantity), 0)::bigint AS "unitsSold",
        COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue,
        COALESCE(SUM((oi.price - oi."costAtSale") * oi.quantity), 0) AS profit
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi."orderId"
      INNER JOIN collection_products cp ON cp."productId" = oi."productId"
      INNER JOIN collections c ON c.id = cp."collectionId"
      WHERE o.status != 'CANCELLED'
      GROUP BY c.id, c.name
      LIMIT 40
    `;

    const items = rows.map((row) => ({
      collectionId: row.collectionId,
      name: row.name,
      unitsSold: Number(row.unitsSold),
      revenue: toNumber(row.revenue),
      profit: toNumber(row.profit),
    }));

    return rankItems(items, rankBy, 8);
  }

  private async getTopCategories(rankBy: StatsRankBy) {
    const rows = await this.prisma.$queryRaw<
      {
        categoryId: string;
        name: string;
        unitsSold: bigint;
        revenue: unknown;
        profit: unknown;
      }[]
    >`
      SELECT
        cat.id AS "categoryId",
        cat.name,
        COALESCE(SUM(oi.quantity), 0)::bigint AS "unitsSold",
        COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue,
        COALESCE(SUM((oi.price - oi."costAtSale") * oi.quantity), 0) AS profit
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi."orderId"
      INNER JOIN products p ON p.id = oi."productId"
      INNER JOIN categories cat ON cat.id = p."categoryId"
      WHERE o.status != 'CANCELLED'
      GROUP BY cat.id, cat.name
      LIMIT 40
    `;

    const items = rows.map((row) => ({
      categoryId: row.categoryId,
      name: row.name,
      unitsSold: Number(row.unitsSold),
      revenue: toNumber(row.revenue),
      profit: toNumber(row.profit),
    }));

    return rankItems(items, rankBy, 8);
  }

  private async countProductsNeedingRestock() {
    const rows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM products
      WHERE "isActive" = true AND stock <= "restockLimit"
    `;
    return Number(rows[0]?.count ?? 0);
  }

  private async getProductsNeedingRestock() {
    const products = await this.prisma.$queryRaw<
      {
        id: string;
        name: string;
        sku: string;
        stock: number;
        restockLimit: number;
        imageUrl: string | null;
      }[]
    >`
      SELECT id, name, sku, stock, "restockLimit", "imageUrl"
      FROM products
      WHERE "isActive" = true AND stock <= "restockLimit"
      ORDER BY stock ASC, name ASC
      LIMIT 50
    `;

    if (products.length === 0) {
      return [];
    }

    const incoming = await this.prisma.supplierOrderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: products.map((p) => p.id) },
        supplierOrder: { status: SupplierOrderStatus.ON_THE_WAY },
      },
      _sum: { quantity: true },
    });
    const incomingMap = new Map(
      incoming.map((row) => [row.productId, row._sum.quantity ?? 0]),
    );

    return products.map((product) => ({
      ...product,
      incomingStock: incomingMap.get(product.id) ?? 0,
    }));
  }

  private async getTopProducts(from: Date, to: Date, rankBy: StatsRankBy) {
    const rows = await this.prisma.$queryRaw<
      {
        productId: string;
        name: string;
        sku: string;
        imageUrl: string | null;
        unitsSold: bigint;
        revenue: unknown;
        profit: unknown;
      }[]
    >`
      SELECT
        p.id AS "productId",
        p.name,
        p.sku,
        p."imageUrl",
        COALESCE(SUM(oi.quantity), 0)::bigint AS "unitsSold",
        COALESCE(SUM(oi.price * oi.quantity), 0) AS revenue,
        COALESCE(SUM((oi.price - oi."costAtSale") * oi.quantity), 0) AS profit
      FROM order_items oi
      INNER JOIN orders o ON o.id = oi."orderId"
      INNER JOIN products p ON p.id = oi."productId"
      WHERE o.status != 'CANCELLED'
        AND o."createdAt" >= ${from}
        AND o."createdAt" <= ${to}
      GROUP BY p.id, p.name, p.sku, p."imageUrl"
      LIMIT 40
    `;

    const items = rows.map((row) => ({
      productId: row.productId,
      name: row.name,
      sku: row.sku,
      imageUrl: row.imageUrl,
      unitsSold: Number(row.unitsSold),
      revenue: toNumber(row.revenue),
      profit: toNumber(row.profit),
    }));

    return rankItems(items, rankBy, 10);
  }

  private async getTopCustomers(from: Date, to: Date, rankBy: StatsRankBy) {
    const rows = await this.prisma.$queryRaw<
      {
        userId: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        orderCount: bigint;
        totalSpent: unknown;
      }[]
    >`
      SELECT
        u.id AS "userId",
        u.email,
        u."firstName",
        u."lastName",
        COUNT(DISTINCT o.id)::bigint AS "orderCount",
        COALESCE(SUM(o."totalAmount"), 0) AS "totalSpent"
      FROM orders o
      INNER JOIN users u ON u.id = o."userId"
      WHERE o.status != 'CANCELLED'
        AND o."createdAt" >= ${from}
        AND o."createdAt" <= ${to}
      GROUP BY u.id, u.email, u."firstName", u."lastName"
      LIMIT 40
    `;

    const items = rows.map((row) => ({
      userId: row.userId,
      email: row.email,
      firstName: row.firstName,
      lastName: row.lastName,
      orderCount: Number(row.orderCount),
      totalSpent: toNumber(row.totalSpent),
    }));

    const customerRankBy =
      rankBy === 'units' || rankBy === 'revenue' || rankBy === 'profit'
        ? 'spent'
        : rankBy;

    return rankItems(items, customerRankBy, 10);
  }

  private async getNewCustomersOverTime(from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<{ bucket: Date; count: bigint }[]>`
      SELECT DATE_TRUNC('month', u."createdAt") AS bucket, COUNT(*)::bigint AS count
      FROM users u
      WHERE u.role = 'USER'
        AND u."createdAt" >= ${from}
        AND u."createdAt" <= ${to}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    return rows.map((row) => ({
      month: formatMonthKey(row.bucket),
      count: Number(row.count),
    }));
  }

  private async getSupplierSpendingTrend(from: Date, to: Date) {
    const rows = await this.prisma.$queryRaw<
      { bucket: Date; spent: unknown; orderCount: bigint }[]
    >`
      SELECT
        DATE_TRUNC('month', so."createdAt") AS bucket,
        COALESCE(SUM(soi.quantity * soi."unitCost"), 0) AS spent,
        COUNT(DISTINCT so.id)::bigint AS "orderCount"
      FROM supplier_orders so
      INNER JOIN supplier_order_items soi ON soi."supplierOrderId" = so.id
      WHERE so.status = 'RECEIVED'
        AND so."createdAt" >= ${from}
        AND so."createdAt" <= ${to}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;

    return rows.map((row) => ({
      month: formatMonthKey(row.bucket),
      spent: toNumber(row.spent),
      orderCount: Number(row.orderCount),
    }));
  }

  private async getTopSuppliers(rankBy: StatsRankBy) {
    const rows = await this.prisma.$queryRaw<
      {
        supplierId: string;
        name: string;
        orderCount: bigint;
        totalSpent: unknown;
      }[]
    >`
      SELECT
        s.id AS "supplierId",
        s.name,
        COUNT(DISTINCT so.id)::bigint AS "orderCount",
        COALESCE(SUM(soi.quantity * soi."unitCost"), 0) AS "totalSpent"
      FROM supplier_orders so
      INNER JOIN suppliers s ON s.id = so."supplierId"
      INNER JOIN supplier_order_items soi ON soi."supplierOrderId" = so.id
      WHERE so.status = 'RECEIVED'
      GROUP BY s.id, s.name
      LIMIT 40
    `;

    const items = rows.map((row) => ({
      supplierId: row.supplierId,
      name: row.name,
      orderCount: Number(row.orderCount),
      totalSpent: toNumber(row.totalSpent),
    }));

    const supplierRankBy =
      rankBy === 'units' || rankBy === 'revenue' || rankBy === 'profit'
        ? 'spent'
        : rankBy;

    return rankItems(items, supplierRankBy, 10);
  }

  private serializeOrder(order: Prisma.OrderGetPayload<{ include: typeof adminOrderSummaryInclude }>) {
    return {
      ...order,
      totalAmount: order.totalAmount.toString(),
      orderItems: order.orderItems.map((item) => ({
        ...item,
        price: item.price.toString(),
        costAtSale: item.costAtSale.toString(),
        product: {
          ...item.product,
          price: item.product.price.toString(),
          cost: item.product.cost.toString(),
        },
      })),
      payment: order.payment
        ? {
            ...order.payment,
            amount: order.payment.amount.toString(),
          }
        : null,
    };
  }
}
