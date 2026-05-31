import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateHomepageSettingsDto } from './dto/update-homepage-settings.dto';

const HOMEPAGE_ID = 'homepage';

const homepageInclude = {
  latestCollection: {
    include: {
      collectionProducts: {
        where: { product: { isActive: true } },
        orderBy: { position: 'asc' },
        include: { product: { include: { category: true } } },
      },
    },
  },
  trendingCollection: {
    include: {
      collectionProducts: {
        where: { product: { isActive: true } },
        orderBy: { position: 'asc' },
        include: { product: { include: { category: true } } },
      },
    },
  },
  bannerCollection: true,
  pairLeftCollection: {
    include: {
      collectionProducts: {
        where: { product: { isActive: true } },
        orderBy: { position: 'asc' },
        include: { product: { include: { category: true } } },
      },
    },
  },
  pairRightCollection: {
    include: {
      collectionProducts: {
        where: { product: { isActive: true } },
        orderBy: { position: 'asc' },
        include: { product: { include: { category: true } } },
      },
    },
  },
} satisfies Prisma.HomepageSettingsInclude;

type HomepageSettingsPayload = Prisma.HomepageSettingsGetPayload<{
  include: typeof homepageInclude;
}>;

@Injectable()
export class HomepageService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.homepageSettings.upsert({
      where: { id: HOMEPAGE_ID },
      create: { id: HOMEPAGE_ID },
      update: {},
      include: homepageInclude,
    });

    return this.hideInactiveCollections(settings);
  }

  async updateSettings(dto: UpdateHomepageSettingsDto) {
    await Promise.all([
      this.ensureCollectionExists(dto.latestCollectionId),
      this.ensureCollectionExists(dto.trendingCollectionId),
      this.ensureCollectionExists(dto.bannerCollectionId),
      this.ensureCollectionExists(dto.pairLeftCollectionId),
      this.ensureCollectionExists(dto.pairRightCollectionId),
    ]);

    const settings = await this.prisma.homepageSettings.upsert({
      where: { id: HOMEPAGE_ID },
      create: {
        id: HOMEPAGE_ID,
        ...dto,
        bannerButtonText: dto.bannerButtonText?.trim() || 'See Collection',
      },
      update: {
        ...dto,
        ...(dto.bannerButtonText !== undefined
          ? {
              bannerButtonText: dto.bannerButtonText.trim() || 'See Collection',
            }
          : {}),
      },
      include: homepageInclude,
    });

    return this.hideInactiveCollections(settings);
  }

  private hideInactiveCollections(settings: HomepageSettingsPayload) {
    const latestCollection = settings.latestCollection?.isActive
      ? settings.latestCollection
      : null;
    const trendingCollection = settings.trendingCollection?.isActive
      ? settings.trendingCollection
      : null;
    const bannerCollection = settings.bannerCollection?.isActive
      ? settings.bannerCollection
      : null;
    const pairLeftCollection = settings.pairLeftCollection?.isActive
      ? settings.pairLeftCollection
      : null;
    const pairRightCollection = settings.pairRightCollection?.isActive
      ? settings.pairRightCollection
      : null;

    return {
      ...settings,
      latestCollectionId: latestCollection?.id ?? null,
      latestCollection,
      trendingCollectionId: trendingCollection?.id ?? null,
      trendingCollection,
      bannerCollectionId: bannerCollection?.id ?? null,
      bannerCollection,
      pairLeftCollectionId: pairLeftCollection?.id ?? null,
      pairLeftCollection,
      pairRightCollectionId: pairRightCollection?.id ?? null,
      pairRightCollection,
    };
  }

  private async ensureCollectionExists(id: string | null | undefined) {
    if (!id) {
      return;
    }

    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
  }
}
