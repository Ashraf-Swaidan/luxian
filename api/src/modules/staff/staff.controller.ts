import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { PERMISSIONS } from '../auth/permissions/permission.registry';
import { StaffService } from './staff.service';
import { CreateStaffRoleDto } from './dto/create-staff-role.dto';
import { UpdateStaffRoleDto } from './dto/update-staff-role.dto';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';

@Controller('staff')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(PERMISSIONS.STAFF_MANAGE)
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Get('permissions')
  listPermissions() {
    return this.staffService.listPermissions();
  }

  @Get('roles')
  listRoles() {
    return this.staffService.listRoles();
  }

  @Post('roles')
  createRole(@Body() dto: CreateStaffRoleDto) {
    return this.staffService.createRole(dto);
  }

  @Patch('roles/:id')
  updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffRoleDto,
  ) {
    return this.staffService.updateRole(id, dto);
  }

  @Delete('roles/:id')
  deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffService.deleteRole(id);
  }

  @Get('users')
  listUsers() {
    return this.staffService.listStaffUsers();
  }

  @Post('users')
  createUser(@Body() dto: CreateStaffUserDto) {
    return this.staffService.createStaffUser(dto);
  }

  @Patch('users/:id')
  updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffUserDto,
  ) {
    return this.staffService.updateStaffUser(id, dto);
  }
}
