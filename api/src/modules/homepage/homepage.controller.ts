import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import { UpdateHomepageSettingsDto } from './dto/update-homepage-settings.dto';
import { HomepageService } from './homepage.service';

@Controller('homepage')
export class HomepageController {
  constructor(private readonly homepageService: HomepageService) {}

  @Get()
  getSettings() {
    return this.homepageService.getSettings();
  }

  @Patch()
  @Permissions(PERMISSIONS.HOMEPAGE_WRITE)
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  updateSettings(@Body() dto: UpdateHomepageSettingsDto) {
    return this.homepageService.updateSettings(dto);
  }
}
