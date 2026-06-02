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
import { OrderStatus, Role } from '@prisma/client';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';
import type { AuthUser } from '../auth/types/auth-user.type';
import { Roles } from '../auth/decorators/roles.decorators';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  checkout(@Request() req: { user: AuthUser }, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.id, dto);
  }

  @Get()
  getOrders(@Request() req: { user: AuthUser }) {
    return this.ordersService.getOrders(req.user.id);
  }

  @Get('admin')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAdminOrders(@Query('status') status?: OrderStatus) {
    return this.ordersService.getAdminOrders(status);
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  getAdminOrder(@Param('id') id: string) {
    return this.ordersService.getAdminOrder(id);
  }

  @Patch('admin/:id/status')
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateAdminOrderStatus(
    @Param('id') id: string,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateAdminOrderStatus(id, dto);
  }

  @Get(':id')
  getOrder(@Request() req: { user: AuthUser }, @Param('id') id: string) {
    return this.ordersService.getOrder(req.user.id, id);
  }
}
