import { Matches } from 'class-validator';

export const HEX_COLOR_REGEX = /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

export const IsHexColor = () =>
  Matches(HEX_COLOR_REGEX, {
    message: 'Must be a valid hex color (#RGB or #RRGGBB)',
  });
