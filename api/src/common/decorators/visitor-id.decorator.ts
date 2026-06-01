import { createParamDecorator, ExecutionContext } from '@nestjs/common';

const VISITOR_ID_HEADER = 'x-visitor-id';
const MAX_VISITOR_ID_LENGTH = 64;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseVisitorId(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_VISITOR_ID_LENGTH) {
    return undefined;
  }
  if (!UUID_REGEX.test(trimmed)) {
    return undefined;
  }
  return trimmed;
}

/** Reads `X-Visitor-Id` when it is a valid UUID (anonymous session). */
export const VisitorId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const raw = request.headers[VISITOR_ID_HEADER];
    const value = Array.isArray(raw) ? raw[0] : raw;
    return parseVisitorId(value);
  },
);
