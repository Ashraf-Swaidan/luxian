import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const paymentWithOrder = Prisma.validator<Prisma.PaymentDefaultArgs>()({
  include: {
    order: {
      include: {
        orderItems: {
          include: { product: true },
          orderBy: { product: { name: 'asc' } },
        },
      },
    },
  },
});

export type PaymentWithOrder = Prisma.PaymentGetPayload<
  typeof paymentWithOrder
>;

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPaymentForOrder(
    userId: string,
    orderId: string,
  ): Promise<PaymentWithOrder> {
    const payment = await this.prisma.payment.findFirst({
      where: { orderId, userId },
      ...paymentWithOrder,
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
