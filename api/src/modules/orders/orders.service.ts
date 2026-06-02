import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
  StockMovementType,
} from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

const orderWithItems = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    orderItems: {
      include: { product: true },
      orderBy: { product: { name: 'asc' } },
    },
    cart: true,
    payment: true,
  },
});

const adminOrderWithItems = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
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
      orderBy: { product: { name: 'asc' } },
    },
    cart: true,
    payment: true,
  },
});

export type OrderWithItems = Prisma.OrderGetPayload<typeof orderWithItems>;
export type AdminOrderWithItems = Prisma.OrderGetPayload<
  typeof adminOrderWithItems
>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Place order = pay in one step (stub). No order row and no stock change
   * unless the full transaction succeeds. There are no unpaid PENDING orders.
   */
  async checkout(userId: string, dto: CheckoutDto): Promise<OrderWithItems> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId, checkedOut: false },
      include: { cartItems: { include: { product: true } } },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    if (cart.cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    this.assertCartReadyForCheckout(cart.cartItems);

    const totalAmount = cart.cartItems.reduce(
      (sum, line) => sum + Number(line.product.price) * line.quantity,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      for (const line of cart.cartItems) {
        const updated = await tx.product.updateMany({
          where: {
            id: line.productId,
            isActive: true,
            stock: { gte: line.quantity },
          },
          data: { stock: { decrement: line.quantity } },
        });

        if (updated.count === 0) {
          throw new BadRequestException('Not enough stock');
        }
      }

      const order = await tx.order.create({
        data: {
          userId,
          cartId: cart.id,
          status: OrderStatus.PROCESSING,
          totalAmount,
          shippingAddress: dto.shippingAddress,
          orderItems: {
            create: cart.cartItems.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              price: line.product.price,
              costAtSale: line.product.cost,
            })),
          },
          payment: {
            create: {
              userId,
              amount: totalAmount,
              status: PaymentStatus.COMPLETED,
              paymentMethod: 'stub',
              transactionId: `stub_${randomUUID()}`,
            },
          },
        },
      });

      await tx.stockMovement.createMany({
        data: cart.cartItems.map((line) => ({
          productId: line.productId,
          orderId: order.id,
          type: StockMovementType.CUSTOMER_ORDER,
          quantityDelta: -line.quantity,
          note: `Customer order ${order.orderNumber}`,
        })),
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { checkedOut: true },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        ...orderWithItems,
      });
    });
  }

  async getOrders(userId: string): Promise<OrderWithItems[]> {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      ...orderWithItems,
    });
  }

  async getOrder(userId: string, orderId: string): Promise<OrderWithItems> {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      ...orderWithItems,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async getAdminOrders(status?: OrderStatus): Promise<AdminOrderWithItems[]> {
    return this.prisma.order.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
      ...adminOrderWithItems,
    });
  }

  async getAdminOrder(orderId: string): Promise<AdminOrderWithItems> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      ...adminOrderWithItems,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateAdminOrderStatus(
    orderId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<AdminOrderWithItems> {
    const order = await this.getAdminOrder(orderId);
    this.assertOrderTransition(order.status, dto.status);

    return this.prisma.$transaction(async (tx) => {
      if (
        dto.status === OrderStatus.CANCELLED &&
        dto.restock &&
        (order.status === OrderStatus.PROCESSING ||
          order.status === OrderStatus.SHIPPED)
      ) {
        for (const item of order.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              orderId: order.id,
              type: StockMovementType.ORDER_RESTOCK,
              quantityDelta: item.quantity,
              note: `Restocked cancelled order ${order.orderNumber}`,
            },
          });
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: { status: dto.status },
      });

      return tx.order.findUniqueOrThrow({
        where: { id: order.id },
        ...adminOrderWithItems,
      });
    });
  }

  private assertCartReadyForCheckout(
    items: Array<{
      quantity: number;
      product: { name: string; stock: number; isActive: boolean };
    }>,
  ): void {
    for (const line of items) {
      if (!line.product.isActive) {
        throw new BadRequestException(
          `Product unavailable: ${line.product.name}`,
        );
      }
      if (line.product.stock < line.quantity) {
        throw new BadRequestException('Not enough stock');
      }
    }
  }

  private assertOrderTransition(from: OrderStatus, to: OrderStatus): void {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
      [OrderStatus.DELIVERED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    if (!allowedTransitions[from].includes(to)) {
      throw new BadRequestException(
        `Order cannot move from ${from} to ${to}`,
      );
    }
  }
}
