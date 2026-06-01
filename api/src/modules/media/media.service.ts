import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MediaOwnerType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { extractUploadThingKey } from './media.utils';

export type RecordImageChangeInput = {
  ownerType: MediaOwnerType;
  ownerId: string;
  slot?: string;
  newUrl: string | null | undefined;
  uploadedById?: string;
};

@Injectable()
export class MediaService {
  constructor(private readonly prisma: PrismaService) {}

  async recordImageChange(input: RecordImageChangeInput) {
    const slot = input.slot ?? 'image';
    const newUrl = input.newUrl ?? null;

    const current = await this.prisma.mediaAsset.findFirst({
      where: {
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        slot,
        isCurrent: true,
        deletedAt: null,
      },
    });

    if (current?.url === newUrl) {
      return;
    }

    if (current) {
      await this.prisma.mediaAsset.update({
        where: { id: current.id },
        data: { isCurrent: false },
      });
    }

    if (!newUrl) {
      return;
    }

    const key = extractUploadThingKey(newUrl);
    const existing = await this.prisma.mediaAsset.findFirst({
      where: {
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        slot,
        url: newUrl,
      },
    });

    if (existing) {
      await this.prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          isCurrent: true,
          key: key ?? existing.key,
        },
      });
      return;
    }

    await this.prisma.mediaAsset.create({
      data: {
        ownerType: input.ownerType,
        ownerId: input.ownerId,
        slot,
        url: newUrl,
        key,
        uploadedById: input.uploadedById,
        isCurrent: true,
      },
    });
  }

  listHistory(ownerType: MediaOwnerType, ownerId: string, slot = 'image') {
    return this.prisma.mediaAsset.findMany({
      where: {
        ownerType,
        ownerId,
        slot,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markDeleted(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });

    if (!asset) {
      throw new NotFoundException('Media asset not found');
    }

    if (asset.isCurrent) {
      throw new BadRequestException('Cannot delete the current image');
    }

    if (asset.deletedAt) {
      return { id: asset.id, key: asset.key };
    }

    await this.prisma.mediaAsset.update({
      where: { id },
      data: { deletedAt: new Date(), isCurrent: false },
    });

    return { id: asset.id, key: asset.key };
  }
}
