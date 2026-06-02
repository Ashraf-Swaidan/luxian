import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import { AUTH_COOKIE_NAMES } from '../constants/auth-cookies';
import { PermissionsService } from '../permissions/permissions.service';
import type { AuthUser } from '../types/auth-user.type';

function extractJwtFromCookie(req: Request): string | null {
  const token = req.cookies?.[AUTH_COOKIE_NAMES.accessToken];
  return typeof token === 'string' && token.length > 0 ? token : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly permissionsService: PermissionsService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>('JWT_SECRET') ?? 'default_secret2026',
    });
  }

  async validate(payload: { sub: string; email: string }): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        staffRoleId: true,
        isStaffActive: true,
        staffRole: { select: { name: true } },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    const permissions = await this.permissionsService.resolvePermissionsForUser(
      user,
    );

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      permissions,
      staffRoleId: user.staffRoleId,
      staffRoleName: user.staffRole?.name ?? null,
      isStaffActive: user.isStaffActive,
    };
  }
}
