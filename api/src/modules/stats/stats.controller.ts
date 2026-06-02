import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import { SalesStatsQueryDto, StatsQueryDto } from './dto/stats-query.dto';
import { StatsService } from './stats.service';

@Controller('admin/stats')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(PERMISSIONS.DASHBOARD_READ)
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
