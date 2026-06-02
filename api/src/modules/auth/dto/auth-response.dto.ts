import { Role } from '@prisma/client';
import type { Permission } from '../permissions/permission.registry';

export class AuthUserDto {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  permissions: Permission[];
  staffRoleId: string | null;
  staffRoleName: string | null;
}

export class AuthResponseDto {
  user: AuthUserDto;
  csrfToken: string;
}
