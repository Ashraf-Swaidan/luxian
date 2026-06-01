import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const favoriteProductInclude = {
  product: {
    include: {
      category: true,
      images: { orderBy: { position: 'asc' as const } },
    },
  },
} satisfies Prisma.FavoriteProductInclude;

export type FavoriteProductWithProduct = Prisma.FavoriteProductGetPayload<{
  include: typeof favoriteProductInclude;
}>;

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<FavoriteProductWithProduct[]> {
    return this.prisma.favoriteProduct.findMany({
      where: { userId, product: { isActive: true } },
      include: favoriteProductInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async status(userId: string, productId: string) {
    const favorite = await this.prisma.favoriteProduct.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });

    return { productId, isFavorite: Boolean(favorite) };
  }

  async add(userId: string, productId: string) {
    await this.ensureProductExists(productId);

    await this.prisma.favoriteProduct.upsert({
      where: { userId_productId: { userId, productId } },
      create: { userId, productId },
      update: {},
    });

    return this.status(userId, productId);
  }

  async remove(userId: string, productId: string) {
    await this.prisma.favoriteProduct.deleteMany({
      where: { userId, productId },
    });

    return this.status(userId, productId);
  }

  async toggle(userId: string, productId: string) {
    await this.ensureProductExists(productId);

    const existing = await this.prisma.favoriteProduct.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { id: true },
    });

    if (existing) {
      return this.remove(userId, productId);
    }

    return this.add(userId, productId);
  }

  private async ensureProductExists(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }
}
