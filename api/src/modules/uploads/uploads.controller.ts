import {
  BadRequestException,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import { UploadsService } from './uploads.service';

const MAX_BYTES = 5 * 1024 * 1024;

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  /** Admin — upload product/category image to Cloudflare R2 */
  @Post('image')
  @Permissions(PERMISSIONS.MEDIA_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: MAX_BYTES },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('folder') folder?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File field "file" is required');
    }
    return this.uploadsService.uploadImage(file, folder ?? 'uploads');
  }
}
