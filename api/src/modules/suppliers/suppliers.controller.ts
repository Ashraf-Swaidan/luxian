import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SupplierOrderStatus } from '@prisma/client';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateSupplierOrderDto } from './dto/create-supplier-order.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierOrderDto } from './dto/update-supplier-order.dto';
import { SuppliersService } from './suppliers.service';

@Controller()
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get('suppliers')
  @Permissions(PERMISSIONS.SUPPLIERS_READ)
  listSuppliers() {
    return this.suppliersService.listSuppliers();
  }

  @Post('suppliers')
  @Permissions(PERMISSIONS.SUPPLIERS_WRITE)
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(dto);
  }

  @Patch('suppliers/:id')
  @Permissions(PERMISSIONS.SUPPLIERS_WRITE)
  updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.updateSupplier(id, dto);
  }

  @Delete('suppliers/:id')
  @Permissions(PERMISSIONS.SUPPLIERS_WRITE)
  deactivateSupplier(@Param('id') id: string) {
    return this.suppliersService.deactivateSupplier(id);
  }

  @Get('supplier-orders')
  @Permissions(PERMISSIONS.SUPPLIERS_READ)
  listSupplierOrders(@Query('status') status?: SupplierOrderStatus) {
    return this.suppliersService.listSupplierOrders(status);
  }

  @Get('supplier-orders/:id')
  @Permissions(PERMISSIONS.SUPPLIERS_READ)
  getSupplierOrder(@Param('id') id: string) {
    return this.suppliersService.getSupplierOrder(id);
  }

  @Post('supplier-orders')
  @Permissions(PERMISSIONS.SUPPLIERS_WRITE)
  createSupplierOrder(@Body() dto: CreateSupplierOrderDto) {
    return this.suppliersService.createSupplierOrder(dto);
  }

  @Patch('supplier-orders/:id')
  @Permissions(PERMISSIONS.SUPPLIERS_WRITE)
  updateSupplierOrder(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierOrderDto,
  ) {
    return this.suppliersService.updateSupplierOrder(id, dto);
  }

  @Post('supplier-orders/:id/receive')
  @Permissions(PERMISSIONS.SUPPLIERS_WRITE)
  receiveSupplierOrder(@Param('id') id: string) {
    return this.suppliersService.receiveSupplierOrder(id);
  }

  @Post('supplier-orders/:id/cancel')
  @Permissions(PERMISSIONS.SUPPLIERS_WRITE)
  cancelSupplierOrder(@Param('id') id: string) {
    return this.suppliersService.cancelSupplierOrder(id);
  }
}
