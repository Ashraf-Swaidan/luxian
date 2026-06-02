export const AUTH_COOKIE_NAMES = {
  accessToken: 'luxian_access_token',
  refreshToken: 'luxian_refresh_token',
  csrf: 'luxian_csrf',
} as const;

export const AUTH_COOKIE_PATHS = {
  access: '/',
  refresh: '/api/v1/auth',
} as const;

export function getCookieDomain(): string | undefined {
  const domain = process.env.COOKIE_DOMAIN?.trim();
  return domain || undefined;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function getCookieBaseOptions() {
  const secure = isProduction();
  return {
    httpOnly: true,
    secure,
    sameSite: 'lax' as const,
    domain: getCookieDomain(),
  };
}

export const ACCESS_TOKEN_MAX_AGE_SEC = 15 * 60;
export const REFRESH_TOKEN_MAX_AGE_SEC = 7 * 24 * 60 * 60;
