import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ALL_PERMISSIONS, type Permission } from './permission.registry';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async resolvePermissionsForUser(user: {
    id: string;
    role: Role;
    staffRoleId: string | null;
    isStaffActive: boolean;
  }): Promise<Permission[]> {
    if (user.role === Role.ADMIN) {
      return [...ALL_PERMISSIONS];
    }

    if (user.role !== Role.STAFF || !user.isStaffActive || !user.staffRoleId) {
      return [];
    }

    const role = await this.prisma.staffRole.findUnique({
      where: { id: user.staffRoleId },
      include: { permissions: true },
    });

    if (!role) {
      return [];
    }

    return role.permissions.map((p) => p.permission as Permission);
  }

  hasPermission(
    userPermissions: Permission[],
    required: Permission | Permission[],
  ): boolean {
    const requiredList = Array.isArray(required) ? required : [required];
    return requiredList.every((p) => userPermissions.includes(p));
  }

  hasAnyPermission(
    userPermissions: Permission[],
    required: Permission[],
  ): boolean {
    return required.some((p) => userPermissions.includes(p));
  }
}
