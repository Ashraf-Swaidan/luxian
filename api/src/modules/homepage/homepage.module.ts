import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MediaModule } from '../media/media.module';
import { HomepageController } from './homepage.controller';
import { HomepageService } from './homepage.service';

@Module({
  imports: [PrismaModule, MediaModule],
  controllers: [HomepageController],
  providers: [HomepageService],
})
export class HomepageModule {}
