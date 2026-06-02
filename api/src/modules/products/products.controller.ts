import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { VisitorId } from 'src/common/decorators/visitor-id.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import type { AuthUser } from '../auth/types/auth-user.type';
import { CreateProductDto } from './dto/create-product.dto';
import { CreateProductImageDto } from './dto/create-product-image.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductContextQueryDto } from './dto/product-context-query.dto';
import { ReorderProductImagesDto } from './dto/reorder-product-images.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateProductImageDto } from './dto/update-product-image.dto';
import { sanitizeProductDtoCost } from './product-sanitizer';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query() query: ListProductsQueryDto,
    @VisitorId() visitorId?: string,
  ) {
    return this.productsService.findAllActive(query, visitorId);
  }

  @Get(':id/context')
  findContext(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ProductContextQueryDto,
    @VisitorId() visitorId?: string,
  ) {
    return this.productsService.findProductContext(id, query, visitorId);
  }

  @Get(':id/manage')
  @Permissions(PERMISSIONS.PRODUCTS_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  findOneForManage(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: { user: AuthUser },
  ) {
    return this.productsService.findOneForManage(id, req.user.permissions);
  }

  @Get(':id/stock-movements')
  @Permissions(PERMISSIONS.PRODUCTS_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  getStockMovements(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.getStockMovements(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOneActive(id);
  }

  @Post()
  @Permissions(PERMISSIONS.PRODUCTS_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  create(@Body() dto: CreateProductDto, @Req() req: { user: AuthUser }) {
    return this.productsService.create(
      sanitizeProductDtoCost(dto, req.user.permissions),
      req.user.permissions,
    );
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.PRODUCTS_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
    @Req() req: { user: AuthUser },
  ) {
    return this.productsService.update(
      id,
      sanitizeProductDtoCost(dto, req.user.permissions),
      req.user.permissions,
    );
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.PRODUCTS_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }

  @Post(':id/images')
  @Permissions(PERMISSIONS.MEDIA_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  addImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateProductImageDto,
  ) {
    return this.productsService.addImage(id, dto);
  }

  @Patch(':id/images/reorder')
  @Permissions(PERMISSIONS.MEDIA_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  reorderImages(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReorderProductImagesDto,
  ) {
    return this.productsService.reorderImages(id, dto);
  }

  @Patch(':id/images/:imageId')
  @Permissions(PERMISSIONS.MEDIA_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    return this.productsService.updateImage(id, imageId, dto);
  }

  @Delete(':id/images/:imageId')
  @Permissions(PERMISSIONS.MEDIA_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  deleteImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
  ) {
    return this.productsService.deleteImage(id, imageId);
  }
}
