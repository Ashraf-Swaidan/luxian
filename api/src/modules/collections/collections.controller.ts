import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import {
  AddCollectionProductDto,
  ReorderCollectionProductsDto,
} from './dto/collection-product.dto';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Get()
  findAll() {
    return this.collectionsService.findAllActive();
  }

  @Get('admin/list')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  findAllForAdmin() {
    return this.collectionsService.findAllForAdmin();
  }

  @Get(':identifier')
  findOne(@Param('identifier') identifier: string) {
    return this.collectionsService.findOneActive(identifier);
  }

  @Post()
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.collectionsService.deactivate(id);
  }

  @Post(':id/products')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  addProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddCollectionProductDto,
  ) {
    return this.collectionsService.addProduct(id, dto);
  }

  @Delete(':id/products/:productId')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  removeProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.collectionsService.removeProduct(id, productId);
  }

  @Patch(':id/products/reorder')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  reorderProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderCollectionProductsDto,
  ) {
    return this.collectionsService.reorderProducts(id, dto);
  }
}
