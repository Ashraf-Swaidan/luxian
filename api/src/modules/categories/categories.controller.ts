import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /** Public — shop listing (active only) */
  @Get()
  findAll() {
    return this.categoriesService.findAllActive();
  }

  /** Admin — create */
  @Post()
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  /** Admin — edit (send only fields to change) */
  @Patch(':id')
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(id, dto);
  }

  /** Admin — deactivate (sets isActive: false) */
  @Delete(':id')
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  deactivate(@Param('id') id: string) {
    return this.categoriesService.deactivate(id);
  }
}
