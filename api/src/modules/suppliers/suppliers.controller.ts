import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role, SupplierOrderStatus } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateSupplierOrderDto } from './dto/create-supplier-order.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierOrderDto } from './dto/update-supplier-order.dto';
import { SuppliersService } from './suppliers.service';

@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get('suppliers')
  listSuppliers() {
    return this.suppliersService.listSuppliers();
  }

  @Post('suppliers')
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.createSupplier(dto);
  }

  @Patch('suppliers/:id')
  updateSupplier(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.suppliersService.updateSupplier(id, dto);
  }

  @Delete('suppliers/:id')
  deactivateSupplier(@Param('id') id: string) {
    return this.suppliersService.deactivateSupplier(id);
  }

  @Get('supplier-orders')
  listSupplierOrders(@Query('status') status?: SupplierOrderStatus) {
    return this.suppliersService.listSupplierOrders(status);
  }

  @Get('supplier-orders/:id')
  getSupplierOrder(@Param('id') id: string) {
    return this.suppliersService.getSupplierOrder(id);
  }

  @Post('supplier-orders')
  createSupplierOrder(@Body() dto: CreateSupplierOrderDto) {
    return this.suppliersService.createSupplierOrder(dto);
  }

  @Patch('supplier-orders/:id')
  updateSupplierOrder(@Param('id') id: string, @Body() dto: UpdateSupplierOrderDto) {
    return this.suppliersService.updateSupplierOrder(id, dto);
  }

  @Post('supplier-orders/:id/receive')
  receiveSupplierOrder(@Param('id') id: string) {
    return this.suppliersService.receiveSupplierOrder(id);
  }

  @Post('supplier-orders/:id/cancel')
  cancelSupplierOrder(@Param('id') id: string) {
    return this.suppliersService.cancelSupplierOrder(id);
  }
}
