import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthModule } from '../auth/auth.module';
import { OrdersController } from './orders.controller';


@Module({
  imports: [ AuthModule],
  providers: [OrdersService],
  controllers: [OrdersController],
})
export class OrdersModule {}
