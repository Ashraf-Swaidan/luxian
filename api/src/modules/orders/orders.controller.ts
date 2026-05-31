import {
  Controller,
  UseGuards,
  Get,
  Post,
  Body,
  Param,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CheckoutDto } from './dto/checkout.dto';
import type { AuthUser } from '../auth/types/auth-user.type';

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

  @Get(':id')
  getOrder(@Request() req: { user: AuthUser }, @Param('id') id: string) {
    return this.ordersService.getOrder(req.user.id, id);
  }
}
