import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import { ListMediaHistoryQueryDto } from './dto/list-media-history-query.dto';
import { MediaService } from './media.service';

@Controller('media')
@Permissions(PERMISSIONS.MEDIA_WRITE)
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
