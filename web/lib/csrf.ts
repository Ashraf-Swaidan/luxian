const CSRF_COOKIE_NAME = "luxian_csrf"

export function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") {
    return null
  }

  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CSRF_COOKIE_NAME}=`))

  if (!match) {
    return null
  }

  return decodeURIComponent(match.slice(CSRF_COOKIE_NAME.length + 1))
}
