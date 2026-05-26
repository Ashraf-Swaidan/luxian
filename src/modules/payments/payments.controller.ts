import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthUser } from '../auth/types/auth-user.type';
import { PaymentsService } from './payments.service';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('orders/:orderId')
  getPaymentForOrder(
    @Request() req: { user: AuthUser },
    @Param('orderId') orderId: string,
  ) {
    return this.paymentsService.getPaymentForOrder(req.user.id, orderId);
  }
}
