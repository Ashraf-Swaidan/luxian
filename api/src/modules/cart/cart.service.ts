import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cart, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

const cartWithItems = Prisma.validator<Prisma.CartDefaultArgs>()({
  include: {
    cartItems: {
      include: {
        product: {
          include: { category: true },
        },
      },
      orderBy: { product: { name: 'asc' } },
    },
  },
});

export type CartWithItems = Prisma.CartGetPayload<typeof cartWithItems>;

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getMyCart(userId: string): Promise<CartWithItems> {
    const cart = await this.getOrCreateOpenCart(userId);
    return this.prisma.cart.findUniqueOrThrow({
      where: { id: cart.id },
      ...cartWithItems,
    });
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartWithItems> {
    const quantity = dto.quantity ?? 1;
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product || !product.isActive) {
      throw new NotFoundException('Product not found');
    }
    if (product.stock < quantity) {
      throw new BadRequestException('Not enough stock');
    }

    const cart = await this.getOrCreateOpenCart(userId);

    const existing = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: { cartId: cart.id, productId: dto.productId },
      },
    });

    if (existing) {
      const newQty = existing.quantity + quantity;
      if (product.stock < newQty) {
        throw new BadRequestException('Not enough stock');
      }
      await this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: newQty },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: dto.productId,
          quantity,
        },
      });
    }

    return this.getMyCart(userId);
  }

  async updateItemQuantity(
    userId: string,
    productId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartWithItems> {
    const cart = await this.getOpenCartOrFail(userId);
    const line = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!line) {
      throw new NotFoundException('Item not in cart');
    }

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product || dto.quantity > product.stock) {
      throw new BadRequestException('Not enough stock');
    }

    await this.prisma.cartItem.update({
      where: { id: line.id },
      data: { quantity: dto.quantity },
    });

    return this.getMyCart(userId);
  }

  async removeItem(userId: string, productId: string): Promise<CartWithItems> {
    const cart = await this.getOpenCartOrFail(userId);
    const line = await this.prisma.cartItem.findUnique({
      where: { cartId_productId: { cartId: cart.id, productId } },
    });

    if (!line) {
      throw new NotFoundException('Item not in cart');
    }

    await this.prisma.cartItem.delete({ where: { id: line.id } });
    return this.getMyCart(userId);
  }

  private async getOrCreateOpenCart(userId: string): Promise<Cart> {
    const existing = await this.prisma.cart.findFirst({
      where: { userId, checkedOut: false },
    });
    if (existing) {
      return existing;
    }
    return this.prisma.cart.create({ data: { userId } });
  }

  private async getOpenCartOrFail(userId: string): Promise<Cart> {
    const cart = await this.prisma.cart.findFirst({
      where: { userId, checkedOut: false },
    });
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }
    return cart;
  }
}
