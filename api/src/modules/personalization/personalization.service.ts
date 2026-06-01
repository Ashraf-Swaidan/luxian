import { BadRequestException, Injectable } from '@nestjs/common';
import { Product, VisitorEventType } from '@prisma/client';
import { parseVisitorId } from 'src/common/decorators/visitor-id.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateVisitorEventDto } from './dto/create-visitor-event.dto';
import {
  buildAffinityProfile,
  rankProductsByAffinity,
  scoreProduct,
} from './personalization.scoring';
import {
  EVENT_LOOKBACK_DAYS,
  MIN_RECOMMENDATION_COUNT,
  MIN_RECOMMENDATION_SCORE,
} from './personalization.types';

const productListInclude = { category: true } as const;

@Injectable()
export class PersonalizationService {
  constructor(private readonly prisma: PrismaService) {}

  async recordEvent(dto: CreateVisitorEventDto) {
    const visitorId = parseVisitorId(dto.visitorId);
    if (!visitorId) {
      throw new BadRequestException('Invalid visitorId');
    }

    await this.validateEventPayload(dto);

    return this.prisma.visitorEvent.create({
      data: {
        visitorId,
        eventType: dto.eventType,
        productId: dto.productId,
        categoryId: dto.categoryId,
        collectionId: dto.collectionId,
        search: dto.search?.trim() || null,
      },
      select: { id: true },
    });
  }

  async getRecommendations(visitorId: string, limit = 12) {
    const profile = await this.loadAffinityProfile(visitorId);
    if (
      profile.categoryScores.size === 0 &&
      profile.productScores.size === 0 &&
      profile.searchTerms.length === 0
    ) {
      return [];
    }

    const topCategoryIds = [...profile.categoryScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    const directProductIds = [...profile.productScores.entries()]
      .filter(([, score]) => score >= MIN_RECOMMENDATION_SCORE)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    const candidates = await this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { id: { in: directProductIds } },
          ...(topCategoryIds.length
            ? [{ categoryId: { in: topCategoryIds } }]
            : []),
        ],
      },
      include: productListInclude,
      take: limit * 3,
    });

    const ranked = candidates
      .map((product) => ({
        product,
        score: scoreProduct(product, profile),
      }))
      .filter((row) => row.score >= MIN_RECOMMENDATION_SCORE)
      .sort((a, b) => b.score - a.score);

    const seen = new Set<string>();
    const products: Product[] = [];
    for (const { product } of ranked) {
      if (seen.has(product.id)) {
        continue;
      }
      seen.add(product.id);
      products.push(product);
      if (products.length >= limit) {
        break;
      }
    }

    return products.length >= MIN_RECOMMENDATION_COUNT ? products : [];
  }

  async rankProductList<T extends Product & { category?: { name: string } | null }>(
    visitorId: string | undefined,
    products: T[],
    options?: { categoryFilterId?: string },
  ): Promise<T[]> {
    if (!visitorId) {
      return products;
    }

    const profile = await this.loadAffinityProfile(visitorId);
    return rankProductsByAffinity(products, profile, options);
  }

  private async loadAffinityProfile(visitorId: string) {
    const since = new Date();
    since.setDate(since.getDate() - EVENT_LOOKBACK_DAYS);

    const events = await this.prisma.visitorEvent.findMany({
      where: { visitorId, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    const productIds = [
      ...new Set(
        events
          .map((event) => event.productId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const products =
      productIds.length > 0
        ? await this.prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, categoryId: true },
          })
        : [];

    const productCategoryById = new Map(
      products.map((product) => [product.id, product.categoryId]),
    );

    return buildAffinityProfile(events, productCategoryById);
  }

  private async validateEventPayload(dto: CreateVisitorEventDto) {
    switch (dto.eventType) {
      case VisitorEventType.SEARCH:
        if (!dto.search?.trim()) {
          throw new BadRequestException('search is required for SEARCH events');
        }
        break;
      case VisitorEventType.PRODUCT_VIEW:
      case VisitorEventType.PRODUCT_CLICK:
        if (!dto.productId) {
          throw new BadRequestException('productId is required for product events');
        }
        await this.ensureActiveProduct(dto.productId);
        break;
      case VisitorEventType.CATEGORY_FILTER:
        if (!dto.categoryId) {
          throw new BadRequestException('categoryId is required for CATEGORY_FILTER');
        }
        await this.ensureActiveCategory(dto.categoryId);
        break;
      case VisitorEventType.COLLECTION_FILTER:
        if (!dto.collectionId) {
          throw new BadRequestException('collectionId is required for COLLECTION_FILTER');
        }
        await this.ensureActiveCollection(dto.collectionId);
        break;
      default:
        break;
    }
  }

  private async ensureActiveProduct(productId: string) {
    const product = await this.prisma.product.findFirst({
      where: { id: productId, isActive: true },
      select: { id: true },
    });
    if (!product) {
      throw new BadRequestException('Product not found');
    }
  }

  private async ensureActiveCategory(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true },
    });
    if (!category) {
      throw new BadRequestException('Category not found');
    }
  }

  private async ensureActiveCollection(collectionId: string) {
    const collection = await this.prisma.collection.findFirst({
      where: { id: collectionId, isActive: true },
      select: { id: true },
    });
    if (!collection) {
      throw new BadRequestException('Collection not found');
    }
  }
}
