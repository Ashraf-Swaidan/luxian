import { Role } from '@prisma/client';

/** Shape attached to req.user by JwtStrategy.validate() */
export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
};
