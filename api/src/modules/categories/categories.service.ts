import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, MediaOwnerType, Prisma } from '@prisma/client';
import { MediaService } from '../media/media.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaService: MediaService,
  ) {}

  findAllActive(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      const category = await this.prisma.category.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive ?? true,
        },
      });

      if (dto.imageUrl) {
        await this.mediaService.recordImageChange({
          ownerType: MediaOwnerType.CATEGORY,
          ownerId: category.id,
          newUrl: dto.imageUrl,
        });
      }

      return category;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category slug already exists');
      }
      throw new InternalServerErrorException('Failed to create category');
    }
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Category not found');
    }

    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: dto,
      });

      if (dto.imageUrl !== undefined && dto.imageUrl !== existing.imageUrl) {
        await this.mediaService.recordImageChange({
          ownerType: MediaOwnerType.CATEGORY,
          ownerId: id,
          newUrl: dto.imageUrl,
        });
      }

      return category;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Category slug already exists');
      }
      throw new InternalServerErrorException('Failed to update category');
    }
  }

  /** Deactivate — hides from public list, keeps row for product relations */
  async deactivate(id: string): Promise<Category> {
    await this.ensureExists(id);

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }

  private async ensureExists(id: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }
}
