import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { CsrfGuard } from './guards/csrf.guard';
import { AuthCookieService } from './services/auth-cookie.service';
import { PermissionsService } from './permissions/permissions.service';

@Global()
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') ?? 'default_secret2026',
        signOptions: {
          expiresIn:
            Number(configService.get<string>('JWT_EXPIRATION')) ?? 3600,
        },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    CsrfGuard,
    AuthCookieService,
    PermissionsService,
  ],
  controllers: [AuthController],
  exports: [
    PassportModule,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    PermissionsGuard,
    CsrfGuard,
    AuthCookieService,
    PermissionsService,
  ],
})
export class AuthModule {}
