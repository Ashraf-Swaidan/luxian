import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SkipCsrf } from './decorators/skip-csrf.decorator';
import { AuthCookieService } from './services/auth-cookie.service';
import { AUTH_COOKIE_NAMES } from './constants/auth-cookies';
import type { AuthUser } from './types/auth-user.type';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly authCookieService: AuthCookieService,
  ) {}

  @Post('register')
  @SkipCsrf()
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { response, tokens } = await this.authService.register(registerDto);
    const csrfToken = this.authCookieService.setAuthCookies(res, tokens);
    return { ...response, csrfToken };
  }

  @Post('login')
  @SkipCsrf()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { response, tokens } = await this.authService.login(loginDto);
    const csrfToken = this.authCookieService.setAuthCookies(res, tokens);
    return { ...response, csrfToken };
  }

  @Post('refresh')
  @SkipCsrf()
  async refresh(
    @Body() refreshDto: RefreshDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken =
      (req.cookies?.[AUTH_COOKIE_NAMES.refreshToken] as string | undefined) ??
      refreshDto.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token required');
    }

    const { response, tokens } = await this.authService.refresh(refreshToken);
    const csrfToken = this.authCookieService.setAuthCookies(res, tokens);
    return { ...response, csrfToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Req() req: { user: AuthUser },
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const result = await this.authService.logout(req.user.id);
    this.authCookieService.clearAuthCookies(res);
    return result;
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { user: AuthUser }): AuthUser {
    return req.user;
  }
}
