import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListMediaHistoryQueryDto } from './dto/list-media-history-query.dto';
import { MediaService } from './media.service';

@Controller('media')
@Roles(Role.ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get('history')
  getHistory(@Query() query: ListMediaHistoryQueryDto) {
    return this.mediaService.listHistory(
      query.ownerType,
      query.ownerId,
      query.slot ?? 'image',
    );
  }

  @Delete(':id')
  markDeleted(@Param('id', ParseUUIDPipe) id: string) {
    return this.mediaService.markDeleted(id);
  }
}
