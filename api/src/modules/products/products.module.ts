import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [AuthModule, MediaModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
