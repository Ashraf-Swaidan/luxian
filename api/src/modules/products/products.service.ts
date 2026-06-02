import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Collection, MediaOwnerType, Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductContextQueryDto } from './dto/product-context-query.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { extractUploadThingKey } from '../media/media.utils';
import { PersonalizationService } from '../personalization/personalization.service';
import { PaginatedProducts, ProductWithCategory } from './products.types';
import type { Permission } from '../auth/permissions/permission.registry';
import {
  sanitizeProductForUser,
  stripProductCost,
} from './product-sanitizer';

const productDetailInclude = {
  category: true,
  images: { orderBy: { position: 'asc' as const } },
} satisfies Prisma.ProductInclude;

const productCardInclude = {
  category: true,
  images: { orderBy: { position: 'asc' as const } },
} satisfies Prisma.ProductInclude;

type ProductDetail = Prisma.ProductGetPayload<{
  include: typeof productDetailInclude;
}>;

type ProductCard = Prisma.ProductGetPayload<{
  include: typeof productCardInclude;
}>;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
    private readonly personalizationService: PersonalizationService,
  ) {}

  async findOneActive(id: string): Promise<ProductWithCategory & { incomingStock: number }> {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: productDetailInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const withStock = await this.attachIncomingStock(product);
    return stripProductCost(withStock);
  }

  async findOneForManage(id: string, permissions: Permission[]) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productDetailInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const withStock = await this.attachIncomingStock(product);
    return sanitizeProductForUser(withStock, permissions);
  }

  async findProductContext(
    id: string,
    query: ProductContextQueryDto,
    visitorId?: string,
  ) {
    const product = await this.findOneActive(id);
    const collectionLimit = Math.min(query.collectionLimit ?? 8, 12);
    const similarLimit = Math.min(query.similarLimit ?? 8, 12);

    const memberships = await this.prisma.collectionProduct.findMany({
      where: {
        productId: id,
        collection: { isActive: true },
      },
      include: {
        collection: true,
      },
    });

    const selectedCollection = await this.selectProductCollection(
      memberships.map((membership) => membership.collection),
      id,
    );
    const collectionProducts = selectedCollection
      ? await this.findCollectionSiblings(
          selectedCollection.id,
          id,
          collectionLimit,
        )
      : [];

    const excludedIds = new Set([
      id,
      ...collectionProducts.map((sibling) => sibling.id),
    ]);
    const similarProducts = await this.findSimilarProducts(
      product as ProductDetail,
      excludedIds,
      similarLimit,
      visitorId,
    );

    return {
      product,
      collection: selectedCollection,
      collectionProducts: collectionProducts.map((item) => stripProductCost(item)),
      similarProducts: similarProducts.map((item) => stripProductCost(item)),
    };
  }

  async findAllActive(
    query: ListProductsQueryDto,
    visitorId?: string,
  ): Promise<PaginatedProducts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;
    const where = this.buildProductWhere(query);

    if (query.collectionId || query.collectionSlug) {
      return this.findAllActiveByCollection(query, where, page, limit, skip);
    }

    const usePersonalization = Boolean(visitorId);

    if (usePersonalization) {
      const [allMatching, total] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: { name: 'asc' },
        }),
        this.prisma.product.count({ where }),
      ]);

      const ranked = await this.personalizationService.rankProductList(
        visitorId,
        allMatching,
        { categoryFilterId: query.categoryId },
      );
      const data = (await this.attachIncomingStock(
        ranked.slice(skip, skip + limit),
      )).map((item) => stripProductCost(item));

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages: total === 0 ? 0 : Math.ceil(total / limit),
        },
      };
    }

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: (await this.attachIncomingStock(rows)).map((item) =>
        stripProductCost(item),
      ),
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  private async selectProductCollection(
    collections: Collection[],
    currentProductId: string,
  ): Promise<Collection | null> {
    if (collections.length === 0) {
      return null;
    }

    const counts = await this.prisma.collectionProduct.groupBy({
      by: ['collectionId'],
      where: {
        collectionId: { in: collections.map((collection) => collection.id) },
        productId: { not: currentProductId },
        product: { isActive: true },
      },
      _count: { productId: true },
    });
    const countByCollectionId = new Map(
      counts.map((row) => [row.collectionId, row._count.productId]),
    );

    return [...collections].sort((left, right) => {
      const rightCount = countByCollectionId.get(right.id) ?? 0;
      const leftCount = countByCollectionId.get(left.id) ?? 0;
      if (rightCount !== leftCount) {
        return rightCount - leftCount;
      }
      return left.name.localeCompare(right.name);
    })[0];
  }

  private async findCollectionSiblings(
    collectionId: string,
    currentProductId: string,
    limit: number,
  ): Promise<ProductCard[]> {
    const rows = await this.prisma.collectionProduct.findMany({
      where: {
        collectionId,
        productId: { not: currentProductId },
        product: { isActive: true },
      },
      include: { product: { include: productCardInclude } },
      orderBy: { position: 'asc' },
      take: limit,
    });

    return this.attachIncomingStock(rows.map((row) => row.product));
  }

  private async findSimilarProducts(
    product: ProductDetail,
    excludedIds: Set<string>,
    limit: number,
    visitorId?: string,
  ): Promise<ProductCard[]> {
    const collectionIds = await this.findProductCollectionIds(product.id);
    const price = Number(product.price);
    const minPrice = Number.isFinite(price) ? price * 0.65 : undefined;
    const maxPrice = Number.isFinite(price) ? price * 1.35 : undefined;

    const candidates = await this.prisma.product.findMany({
      where: {
        isActive: true,
        id: { notIn: [...excludedIds] },
        OR: [
          { categoryId: product.categoryId },
          ...(collectionIds.length
            ? [
                {
                  collectionProducts: {
                    some: { collectionId: { in: collectionIds } },
                  },
                },
              ]
            : []),
          ...(minPrice !== undefined && maxPrice !== undefined
            ? [{ price: { gte: minPrice, lte: maxPrice } }]
            : []),
        ],
      },
      include: productCardInclude,
      take: limit * 5,
    });

    const candidateCollectionIds = await this.findCollectionIdsForProducts(
      candidates.map((candidate) => candidate.id),
    );
    const affinityScores = await this.personalizationService.scoreProductList(
      visitorId,
      candidates,
    );

    const similar = candidates
      .map((candidate) => ({
        product: candidate,
        score: this.scoreSimilarProduct(
          product,
          candidate,
          collectionIds,
          candidateCollectionIds.get(candidate.id) ?? new Set(),
          affinityScores.get(candidate.id) ?? 0,
        ),
      }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }
        return left.product.name.localeCompare(right.product.name);
      })
      .slice(0, limit)
      .map((row) => row.product);

    return this.attachIncomingStock(similar);
  }

  private async attachIncomingStock<T extends { id: string }>(
    products: T[],
  ): Promise<Array<T & { incomingStock: number }>>;
  private async attachIncomingStock<T extends { id: string }>(
    product: T,
  ): Promise<T & { incomingStock: number }>;
  private async attachIncomingStock<T extends { id: string }>(
    input: T | T[],
  ): Promise<(T & { incomingStock: number }) | Array<T & { incomingStock: number }>> {
    const products = Array.isArray(input) ? input : [input];
    if (products.length === 0) {
      return Array.isArray(input) ? [] : { ...input, incomingStock: 0 };
    }

    const rows = await this.prisma.supplierOrderItem.groupBy({
      by: ['productId'],
      where: {
        productId: { in: products.map((product) => product.id) },
        supplierOrder: { status: 'ON_THE_WAY' },
      },
      _sum: { quantity: true },
    });
    const incomingByProductId = new Map(
      rows.map((row) => [row.productId, row._sum.quantity ?? 0]),
    );
    const withIncoming = products.map((product) => ({
      ...product,
      incomingStock: incomingByProductId.get(product.id) ?? 0,
    }));

    return Array.isArray(input) ? withIncoming : withIncoming[0];
  }

  private scoreSimilarProduct(
    source: ProductDetail,
    candidate: ProductCard,
    sourceCollectionIds: string[],
    candidateCollectionIds: Set<string>,
    affinityScore: number,
  ) {
    let score = 0;

    if (candidate.categoryId === source.categoryId) {
      score += 100;
    }

    const sharedCollectionCount = sourceCollectionIds.filter((id) =>
      candidateCollectionIds.has(id),
    ).length;
    score += sharedCollectionCount * 30;

    const sourcePrice = Number(source.price);
    const candidatePrice = Number(candidate.price);
    if (
      Number.isFinite(sourcePrice) &&
      Number.isFinite(candidatePrice) &&
      sourcePrice > 0
    ) {
      const priceDistance =
        Math.abs(candidatePrice - sourcePrice) / sourcePrice;
      score += Math.max(0, 20 - priceDistance * 20);
    }

    score += Math.min(5, affinityScore * 0.25);

    return score;
  }

  private async findProductCollectionIds(productId: string) {
    const rows = await this.prisma.collectionProduct.findMany({
      where: { productId, collection: { isActive: true } },
      select: { collectionId: true },
    });
    return rows.map((row) => row.collectionId);
  }

  private async findCollectionIdsForProducts(productIds: string[]) {
    if (productIds.length === 0) {
      return new Map<string, Set<string>>();
    }

    const rows = await this.prisma.collectionProduct.findMany({
      where: {
        productId: { in: productIds },
        collection: { isActive: true },
      },
      select: { productId: true, collectionId: true },
    });
    const collectionIdsByProductId = new Map<string, Set<string>>();
    for (const row of rows) {
      const current = collectionIdsByProductId.get(row.productId) ?? new Set();
      current.add(row.collectionId);
      collectionIdsByProductId.set(row.productId, current);
    }
    return collectionIdsByProductId;
  }

  private async findAllActiveByCollection(
    query: ListProductsQueryDto,
    productWhere: Prisma.ProductWhereInput,
    page: number,
    limit: number,
    skip: number,
  ): Promise<PaginatedProducts> {
    const collectionWhere: Prisma.CollectionWhereInput = {
      isActive: true,
      ...(query.collectionId ? { id: query.collectionId } : {}),
      ...(query.collectionSlug ? { slug: query.collectionSlug } : {}),
    };

    const where: Prisma.CollectionProductWhereInput = {
      collection: collectionWhere,
      product: productWhere,
    };

    const [rows, total] = await Promise.all([
      this.prisma.collectionProduct.findMany({
        where,
        include: { product: { include: { category: true } } },
        orderBy: { position: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.collectionProduct.count({ where }),
    ]);

    return {
      data: (await this.attachIncomingStock(rows.map((row) => row.product))).map(
        (item) => stripProductCost(item),
      ),
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  private buildProductWhere(
    query: ListProductsQueryDto,
  ): Prisma.ProductWhereInput {
    return {
      isActive: true,
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...this.buildRangeFilters(query),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' } },
              { description: { contains: query.search, mode: 'insensitive' } },
              { sku: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  private buildRangeFilters(
    query: ListProductsQueryDto,
  ): Prisma.ProductWhereInput {
    const filters: Prisma.ProductWhereInput = {};

    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filters.price = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    if (query.minStock !== undefined || query.maxStock !== undefined) {
      filters.stock = {
        ...(query.minStock !== undefined ? { gte: query.minStock } : {}),
        ...(query.maxStock !== undefined ? { lte: query.maxStock } : {}),
      };
    }

    return filters;
  }

  async create(
    dto: CreateProductDto,
    permissions: Permission[],
  ): Promise<ProductWithCategory> {
    await this.ensureCategoryExists(dto.categoryId);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          sku: dto.sku,
          price: dto.price,
          cost: dto.cost ?? 0,
          stock: dto.stock ?? 0,
          restockLimit: dto.restockLimit ?? 10,
          categoryId: dto.categoryId,
          description: dto.description,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive ?? true,
        },
        include: productDetailInclude,
      });

      if (dto.imageUrl) {
        await this.prisma.productImage.create({
          data: {
            productId: product.id,
            url: dto.imageUrl,
            key: extractUploadThingKey(dto.imageUrl),
            position: 0,
          },
        });
        await this.mediaService.recordImageChange({
          ownerType: MediaOwnerType.PRODUCT,
          ownerId: product.id,
          newUrl: dto.imageUrl,
        });
      }

      return this.findOneForManage(product.id, permissions);
    } catch (error) {
      this.handlePrismaError(error, 'Failed to create product');
    }
  }

  async update(
    id: string,
    dto: UpdateProductDto,
    permissions: Permission[],
  ): Promise<ProductWithCategory> {
    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Product not found');
    }

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    try {
      const product = await this.prisma.product.update({
        where: { id },
        data: dto,
        include: productDetailInclude,
      });

      if (dto.imageUrl !== undefined && dto.imageUrl !== existing.imageUrl) {
        await this.syncCoverImage(id, existing.imageUrl, dto.imageUrl);
        await this.mediaService.recordImageChange({
          ownerType: MediaOwnerType.PRODUCT,
          ownerId: id,
          newUrl: dto.imageUrl,
        });
        return this.findOneForManage(id, permissions);
      }

      return sanitizeProductForUser(
        await this.attachIncomingStock(product),
        permissions,
      ) as ProductWithCategory;
    } catch (error) {
      this.handlePrismaError(error, 'Failed to update product');
    }
  }

  async getStockMovements(productId: string) {
    await this.ensureExists(productId);

    return this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
        supplierOrder: {
          select: {
            id: true,
            orderNumber: true,
            status: true,
          },
        },
      },
    });
  }

  async deactivate(id: string): Promise<Product> {
    await this.ensureExists(id);

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: productDetailInclude,
    });
  }

  async addImage(productId: string, dto: CreateProductImageDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const maxPosition = await this.prisma.productImage.aggregate({
      where: { productId },
      _max: { position: true },
    });
    const position = (maxPosition._max.position ?? -1) + 1;
    const key = extractUploadThingKey(dto.url);

    return this.prisma.$transaction(async (tx) => {
      const image = await tx.productImage.create({
        data: {
          productId,
          url: dto.url,
          key,
          altText: dto.altText?.trim() || null,
          position,
        },
      });

      if (!product.imageUrl) {
        await tx.product.update({
          where: { id: productId },
          data: { imageUrl: dto.url },
        });
      }

      return image;
    });
  }

  async updateImage(
    productId: string,
    imageId: string,
    dto: UpdateProductImageDto,
  ) {
    const image = await this.findProductImage(productId, imageId);

    return this.prisma.productImage.update({
      where: { id: image.id },
      data: {
        ...(dto.altText !== undefined
          ? { altText: dto.altText?.trim() || null }
          : {}),
      },
    });
  }

  async reorderImages(productId: string, dto: ReorderProductImagesDto) {
    await this.ensureExists(productId);

    const images = await this.prisma.productImage.findMany({
      where: { productId },
      select: { id: true },
    });

    if (images.length !== dto.imageIds.length) {
      throw new NotFoundException('One or more product images were not found');
    }

    const imageIdSet = new Set(images.map((image) => image.id));
    if (!dto.imageIds.every((id) => imageIdSet.has(id))) {
      throw new NotFoundException('One or more product images were not found');
    }

    await this.prisma.$transaction(
      dto.imageIds.map((id, position) =>
        this.prisma.productImage.update({
          where: { id },
          data: { position },
        }),
      ),
    );

    return this.prisma.productImage.findMany({
      where: { productId },
      orderBy: { position: 'asc' },
    });
  }

  async deleteImage(productId: string, imageId: string) {
    const image = await this.findProductImage(productId, imageId);
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id: productId },
    });

    await this.prisma.productImage.delete({ where: { id: image.id } });

    if (product.imageUrl === image.url) {
      const nextCover = await this.prisma.productImage.findFirst({
        where: { productId },
        orderBy: { position: 'asc' },
      });

      await this.prisma.product.update({
        where: { id: productId },
        data: { imageUrl: nextCover?.url ?? null },
      });
    }

    return { id: image.id, key: image.key };
  }

  private async syncCoverImage(
    productId: string,
    previousUrl: string | null,
    nextUrl: string | null | undefined,
  ) {
    if (previousUrl === nextUrl) {
      return;
    }

    const previousCover = previousUrl
      ? await this.prisma.productImage.findFirst({
          where: { productId, url: previousUrl },
          orderBy: { position: 'asc' },
        })
      : null;

    if (!nextUrl) {
      if (previousCover) {
        await this.prisma.productImage.delete({
          where: { id: previousCover.id },
        });
      }
      return;
    }

    const existingNext = await this.prisma.productImage.findFirst({
      where: { productId, url: nextUrl },
      orderBy: { position: 'asc' },
    });

    if (existingNext) {
      if (previousCover && previousCover.id !== existingNext.id) {
        await this.prisma.productImage.delete({
          where: { id: previousCover.id },
        });
      }
      return;
    }

    if (previousCover) {
      await this.prisma.productImage.update({
        where: { id: previousCover.id },
        data: {
          url: nextUrl,
          key: extractUploadThingKey(nextUrl),
          altText: previousCover.altText,
        },
      });
      return;
    }

    const maxPosition = await this.prisma.productImage.aggregate({
      where: { productId },
      _max: { position: true },
    });

    await this.prisma.productImage.create({
      data: {
        productId,
        url: nextUrl,
        key: extractUploadThingKey(nextUrl),
        position: (maxPosition._max.position ?? -1) + 1,
      },
    });
  }

  private async findProductImage(productId: string, imageId: string) {
    const image = await this.prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      throw new NotFoundException('Product image not found');
    }

    return image;
  }

  private async ensureExists(id: string): Promise<void> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
  }

  private async ensureCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private handlePrismaError(error: unknown, fallbackMessage: string): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Product SKU already exists');
    }
    throw new InternalServerErrorException(fallbackMessage);
  }
}
