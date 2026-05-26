import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAllActive(): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    try {
      return await this.prisma.category.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          imageUrl: dto.imageUrl,
          isActive: dto.isActive ?? true,
        },
      });
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
    await this.ensureExists(id);

    try {
      return await this.prisma.category.update({
        where: { id },
        data: dto,
      });
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
