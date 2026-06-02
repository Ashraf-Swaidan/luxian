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
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import {
  AddCollectionProductDto,
  AddCollectionProductsDto,
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
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  findAllForAdmin() {
    return this.collectionsService.findAllForAdmin();
  }

  @Get(':identifier')
  findOne(@Param('identifier') identifier: string) {
    return this.collectionsService.findOneActive(identifier);
  }

  @Post()
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  create(@Body() dto: CreateCollectionDto) {
    return this.collectionsService.create(dto);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    return this.collectionsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.collectionsService.deactivate(id);
  }

  @Post(':id/products')
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  addProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddCollectionProductDto,
  ) {
    return this.collectionsService.addProduct(id, dto);
  }

  @Post(':id/products/bulk')
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  addProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddCollectionProductsDto,
  ) {
    return this.collectionsService.addProducts(id, dto);
  }

  @Delete(':id/products/:productId')
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  removeProduct(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ) {
    return this.collectionsService.removeProduct(id, productId);
  }

  @Patch(':id/products/reorder')
  @Permissions(PERMISSIONS.CATALOG_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  reorderProducts(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderCollectionProductsDto,
  ) {
    return this.collectionsService.reorderProducts(id, dto);
  }
}
