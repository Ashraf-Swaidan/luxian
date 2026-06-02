import { Role } from '@prisma/client';
import type { Permission } from '../permissions/permission.registry';

/** Shape attached to req.user by JwtStrategy.validate() */
export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
  permissions: Permission[];
  staffRoleId: string | null;
  staffRoleName: string | null;
  isStaffActive: boolean;
};
