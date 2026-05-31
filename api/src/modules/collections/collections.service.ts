import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Collection, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AddCollectionProductDto,
  ReorderCollectionProductsDto,
} from './dto/collection-product.dto';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

const collectionInclude = {
  collectionProducts: {
    orderBy: { position: 'asc' },
    include: { product: { include: { category: true } } },
  },
} satisfies Prisma.CollectionInclude;

@Injectable()
export class CollectionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive() {
    return this.prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  findAllForAdmin() {
    return this.prisma.collection.findMany({
      orderBy: { createdAt: 'desc' },
      include: collectionInclude,
    });
  }

  async findOneActive(identifier: string) {
    const collection = await this.prisma.collection.findFirst({
      where: {
        isActive: true,
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: collectionInclude,
    });

    if (!collection) {
      throw new NotFoundException('Collection not found');
    }

    return collection;
  }

  async create(dto: CreateCollectionDto): Promise<Collection> {
    try {
      return await this.prisma.collection.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive ?? true,
        },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Failed to create collection');
    }
  }

  async update(id: string, dto: UpdateCollectionDto): Promise<Collection> {
    await this.ensureExists(id);

    try {
      return await this.prisma.collection.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error, 'Failed to update collection');
    }
  }

  async deactivate(id: string): Promise<Collection> {
    await this.ensureExists(id);

    return this.prisma.collection.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async addProduct(id: string, dto: AddCollectionProductDto) {
    await this.ensureExists(id);
    await this.ensureProductExists(dto.productId);

    const count = await this.prisma.collectionProduct.count({
      where: { collectionId: id },
    });

    try {
      await this.prisma.collectionProduct.create({
        data: {
          collectionId: id,
          productId: dto.productId,
          position: count,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Product is already in this collection');
      }
      throw new InternalServerErrorException('Failed to add product');
    }

    return this.findOneForAdmin(id);
  }

  async removeProduct(id: string, productId: string) {
    await this.ensureExists(id);

    await this.prisma.collectionProduct.deleteMany({
      where: { collectionId: id, productId },
    });
    await this.compactPositions(id);

    return this.findOneForAdmin(id);
  }

  async reorderProducts(id: string, dto: ReorderCollectionProductsDto) {
    await this.ensureExists(id);

    const existing = await this.prisma.collectionProduct.findMany({
      where: { collectionId: id },
      select: { productId: true },
    });
    const existingIds = new Set(existing.map((item) => item.productId));
    const requestedIds = new Set(dto.productIds);

    if (
      existingIds.size !== requestedIds.size ||
      dto.productIds.some((productId) => !existingIds.has(productId))
    ) {
      throw new ConflictException(
        'Reorder list must include every collection product once',
      );
    }

    await this.prisma.$transaction(
      dto.productIds.map((productId, position) =>
        this.prisma.collectionProduct.update({
          where: {
            collectionId_productId: {
              collectionId: id,
              productId,
            },
          },
          data: { position },
        }),
      ),
    );

    return this.findOneForAdmin(id);
  }

  private async findOneForAdmin(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: collectionInclude,
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    return collection;
  }

  private async compactPositions(id: string) {
    const rows = await this.prisma.collectionProduct.findMany({
      where: { collectionId: id },
      orderBy: { position: 'asc' },
    });

    await this.prisma.$transaction(
      rows.map((row, position) =>
        this.prisma.collectionProduct.update({
          where: { id: row.id },
          data: { position },
        }),
      ),
    );
  }

  private async ensureExists(id: string): Promise<void> {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
  }

  private async ensureProductExists(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private handlePrismaError(error: unknown, fallbackMessage: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Collection slug already exists');
    }
    throw new InternalServerErrorException(fallbackMessage);
  }
}
