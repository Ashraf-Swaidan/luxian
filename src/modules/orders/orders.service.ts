import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CheckoutDto } from './dto/checkout.dto';

const orderWithItems = Prisma.validator<Prisma.OrderDefaultArgs>()({
  include: {
    orderItems: {
      include: { product: true },
      orderBy: { product: { name: 'asc' } },
    },
    cart: true,
  },
});

export type OrderWithItems = Prisma.OrderGetPayload<typeof orderWithItems>;

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

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
          status: OrderStatus.PENDING,
          totalAmount,
          shippingAddress: dto.shippingAddress,
          orderItems: {
            create: cart.cartItems.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
              price: line.product.price,
            })),
          },
        },
        ...orderWithItems,
      });

      await tx.cart.update({
        where: { id: cart.id },
        data: { checkedOut: true },
      });

      return order;
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
}
