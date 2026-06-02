import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import type { Response } from 'express';
import {
  ACCESS_TOKEN_MAX_AGE_SEC,
  AUTH_COOKIE_NAMES,
  AUTH_COOKIE_PATHS,
  getCookieBaseOptions,
  REFRESH_TOKEN_MAX_AGE_SEC,
} from '../constants/auth-cookies';

@Injectable()
export class AuthCookieService {
  setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string },
  ): string {
    const base = getCookieBaseOptions();
    const csrfToken = randomBytes(32).toString('hex');

    res.cookie(AUTH_COOKIE_NAMES.accessToken, tokens.accessToken, {
      ...base,
      path: AUTH_COOKIE_PATHS.access,
      maxAge: ACCESS_TOKEN_MAX_AGE_SEC * 1000,
    });

    res.cookie(AUTH_COOKIE_NAMES.refreshToken, tokens.refreshToken, {
      ...base,
      path: AUTH_COOKIE_PATHS.refresh,
      maxAge: REFRESH_TOKEN_MAX_AGE_SEC * 1000,
    });

    res.cookie(AUTH_COOKIE_NAMES.csrf, csrfToken, {
      ...base,
      httpOnly: false,
      path: AUTH_COOKIE_PATHS.access,
      maxAge: ACCESS_TOKEN_MAX_AGE_SEC * 1000,
    });

    return csrfToken;
  }

  clearAuthCookies(res: Response): void {
    const base = getCookieBaseOptions();

    res.clearCookie(AUTH_COOKIE_NAMES.accessToken, {
      ...base,
      path: AUTH_COOKIE_PATHS.access,
    });
    res.clearCookie(AUTH_COOKIE_NAMES.refreshToken, {
      ...base,
      path: AUTH_COOKIE_PATHS.refresh,
    });
    res.clearCookie(AUTH_COOKIE_NAMES.csrf, {
      ...base,
      httpOnly: false,
      path: AUTH_COOKIE_PATHS.access,
    });
  }
}
