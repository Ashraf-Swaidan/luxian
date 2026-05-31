import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginatedProducts } from './products.types';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneActive(id: string): Promise<Product> {
    const product = await this.prisma.product.findFirst({
      where: { id, isActive: true },
      include: { category: true },
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
      return await this.prisma.product.create({
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
        include: { category: true },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Failed to create product');
    }
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.ensureExists(id);

    if (dto.categoryId) {
      await this.ensureCategoryExists(dto.categoryId);
    }

    try {
      return await this.prisma.product.update({
        where: { id },
        data: dto,
        include: { category: true },
      });
    } catch (error) {
      this.handlePrismaError(error, 'Failed to update product');
    }
  }

  async deactivate(id: string): Promise<Product> {
    await this.ensureExists(id);

    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
      include: { category: true },
    });
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
