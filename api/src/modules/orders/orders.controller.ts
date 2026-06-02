import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Param,
  Request,
  Patch,
  Query,
} from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';
import type { AuthUser } from '../auth/types/auth-user.type';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  checkout(@Request() req: { user: AuthUser }, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.id, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getOrders(@Request() req: { user: AuthUser }) {
    return this.ordersService.getOrders(req.user.id);
  }

  @Get('admin')
  @Permissions(PERMISSIONS.ORDERS_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  getAdminOrders(@Query('status') status?: OrderStatus) {
    return this.ordersService.getAdminOrders(status);
  }

  @Get('admin/:id')
  @Permissions(PERMISSIONS.ORDERS_READ)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  getAdminOrder(@Param('id') id: string) {
    return this.ordersService.getAdminOrder(id);
  }

  @Patch('admin/:id/status')
  @Permissions(PERMISSIONS.ORDERS_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  updateAdminOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateAdminOrderStatus(id, dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getOrder(@Request() req: { user: AuthUser }, @Param('id') id: string) {
    return this.ordersService.getOrder(req.user.id, id);
  }
}
