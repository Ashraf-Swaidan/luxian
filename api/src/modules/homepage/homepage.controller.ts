import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorators';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
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
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateSettings(@Body() dto: UpdateHomepageSettingsDto) {
    return this.homepageService.updateSettings(dto);
  }
}
