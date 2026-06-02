import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import type { Permission } from '../permissions/permission.registry';
import { PermissionsService } from '../permissions/permissions.service';
import type { AuthUser } from '../types/auth-user.type';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest<{ user: AuthUser }>();

    if (!user) {
      throw new ForbiddenException('Insufficient permissions');
    }

    if (user.role === Role.ADMIN) {
      return true;
    }

    if (
      !this.permissionsService.hasPermission(user.permissions, required)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
