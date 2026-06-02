import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, AuthUserDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from '@prisma/client';
import { PermissionsService } from './permissions/permissions.service';
import type { Permission } from './permissions/permission.registry';

type RefreshPayload = {
  sub: string;
  email: string;
  refreshId: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{
    response: AuthResponseDto;
    tokens: AuthTokens;
  }> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          staffRoleId: true,
          isStaffActive: true,
        },
      });

      return this.issueAuthResponse(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(loginDto: LoginDto): Promise<{
    response: AuthResponseDto;
    tokens: AuthTokens;
  }> {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.role === 'STAFF' && !user.isStaffActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.issueAuthResponse(this.toSafeUser(user));
  }

  async refresh(refreshToken: string): Promise<{
    response: AuthResponseDto;
    tokens: AuthTokens;
  }> {
    let payload: RefreshPayload;
    try {
      payload = await this.jwtService.verifyAsync<RefreshPayload>(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (user.role === 'STAFF' && !user.isStaffActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    const isRefreshValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueRefreshResponse(this.toSafeUser(user), refreshToken);
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: 'Logged out successfully' };
  }

  async buildAuthUserDto(userId: string): Promise<AuthUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('User not found');
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
    };
  }

  private async issueAuthResponse(
    user: Pick<
      User,
      | 'id'
      | 'email'
      | 'firstName'
      | 'lastName'
      | 'role'
      | 'staffRoleId'
      | 'isStaffActive'
    >,
  ): Promise<{ response: AuthResponseDto; tokens: AuthTokens }> {
    const tokens = await this.generateTokens(user.id, user.email);
    await this.persistRefreshToken(user.id, tokens.refreshToken);
    const response = await this.buildAuthResponse(user);

    return {
      tokens,
      response,
    };
  }

  private async issueRefreshResponse(
    user: Pick<
      User,
      | 'id'
      | 'email'
      | 'firstName'
      | 'lastName'
      | 'role'
      | 'staffRoleId'
      | 'isStaffActive'
    >,
    refreshToken: string,
  ): Promise<{ response: AuthResponseDto; tokens: AuthTokens }> {
    const accessToken = await this.generateAccessToken(user.id, user.email);
    const response = await this.buildAuthResponse(user);

    return {
      tokens: { accessToken, refreshToken },
      response,
    };
  }

  private async buildAuthResponse(
    user: Pick<
      User,
      | 'id'
      | 'email'
      | 'firstName'
      | 'lastName'
      | 'role'
      | 'staffRoleId'
      | 'isStaffActive'
    >,
  ): Promise<AuthResponseDto> {
    const permissions = await this.permissionsService.resolvePermissionsForUser(
      user,
    );

    const staffRole = user.staffRoleId
      ? await this.prisma.staffRole.findUnique({
          where: { id: user.staffRoleId },
          select: { name: true },
        })
      : null;

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions,
        staffRoleId: user.staffRoleId,
        staffRoleName: staffRole?.name ?? null,
      },
      csrfToken: '',
    };
  }

  private async generateAccessToken(
    userId: string,
    email: string,
  ): Promise<string> {
    return this.jwtService.signAsync(
      { sub: userId, email },
      { expiresIn: '15m' },
    );
  }

  private async generateTokens(
    userId: string,
    email: string,
  ): Promise<AuthTokens> {
    const payload = { sub: userId, email };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(userId, email),
      this.jwtService.signAsync({ ...payload, refreshId }, { expiresIn: '7d' }),
    ]);
    return { accessToken, refreshToken };
  }

  private async persistRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefresh = await bcrypt.hash(refreshToken, this.SALT_ROUNDS);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: hashedRefresh },
    });
  }

  private toSafeUser(
    user: User,
  ): Pick<
    User,
    | 'id'
    | 'email'
    | 'firstName'
    | 'lastName'
    | 'role'
    | 'staffRoleId'
    | 'isStaffActive'
  > {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      staffRoleId: user.staffRoleId,
      isStaffActive: user.isStaffActive,
    };
  }
}
