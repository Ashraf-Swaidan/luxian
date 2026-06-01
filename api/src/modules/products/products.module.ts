import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { PersonalizationModule } from '../personalization/personalization.module';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [AuthModule, MediaModule, PersonalizationModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
