import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { CartModule } from './modules/cart/cart.module';
import { ConfigModule } from '@nestjs/config';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { UploadsModule } from './modules/uploads/uploads.module';

@Module({
  imports: [
    // ConfigModule is used to load the environment variables from the .env file
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    CategoriesModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    PaymentsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
