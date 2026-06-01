import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { MediaOwnerType, Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { extractUploadThingKey } from '../media/media.utils';
import { PaginatedProducts } from './products.types';

const productDetailInclude = {
  category: true,
  images: { orderBy: { position: 'asc' as const } },
} satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  async findOneActive(id: string): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: productDetailInclude,
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findAllActive(query: ListProductsQueryDto): Promise<PaginatedProducts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    const skip = (page - 1) * limit;
    const where = this.buildProductWhere(query);

    if (query.collectionId || query.collectionSlug) {
      return this.findAllActiveByCollection(query, where, page, limit, skip);
    }

    const [data, total] = await Promise.all([
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
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
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
      data: rows.map((row) => row.product),
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

  async create(dto: CreateProductDto): Promise<Product> {
    await this.ensureCategoryExists(dto.categoryId);

    try {
      const product = await this.prisma.product.create({
        data: {
          name: dto.name,
          sku: dto.sku,
          price: dto.price,
          stock: dto.stock ?? 0,
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

      return this.findOneActive(product.id);
    } catch (error) {
      this.handlePrismaError(error, 'Failed to create product');
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
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
        await this.mediaService.recordImageChange({
          ownerType: MediaOwnerType.PRODUCT,
          ownerId: id,
          newUrl: dto.imageUrl,
        });
      }

      return product;
    } catch (error) {
      this.handlePrismaError(error, 'Failed to update product');
    }
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
