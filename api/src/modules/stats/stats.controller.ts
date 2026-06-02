import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SalesStatsQueryDto, StatsQueryDto } from './dto/stats-query.dto';
import { StatsService } from './stats.service';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  getOverview() {
    return this.statsService.getOverview();
  }

  @Get('sales')
  getSales(@Query() query: SalesStatsQueryDto) {
    return this.statsService.getSales(query);
  }

  @Get('orders')
  getOrders(@Query() query: StatsQueryDto) {
    return this.statsService.getOrders(query);
  }

  @Get('products')
  getProducts(@Query() query: StatsQueryDto) {
    return this.statsService.getProducts(query);
  }

  @Get('customers')
  getCustomers(@Query() query: StatsQueryDto) {
    return this.statsService.getCustomers(query);
  }

  @Get('suppliers')
  getSuppliers(@Query() query: StatsQueryDto) {
    return this.statsService.getSuppliers(query);
  }
}
