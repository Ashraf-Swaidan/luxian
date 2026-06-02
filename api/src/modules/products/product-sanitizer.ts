import type { Permission } from '../auth/permissions/permission.registry';
import { PERMISSIONS } from '../auth/permissions/permission.registry';

type WithCost = { cost?: unknown };

export function canReadProductCost(permissions: Permission[]): boolean {
  return permissions.includes(PERMISSIONS.PRODUCTS_COST_READ);
}

export function canWriteProductCost(permissions: Permission[]): boolean {
  return permissions.includes(PERMISSIONS.PRODUCTS_COST_WRITE);
}

export function stripProductCost<T extends WithCost>(product: T): Omit<T, 'cost'> {
  const { cost: _cost, ...rest } = product;
  return rest;
}

export function sanitizeProductForUser<T extends WithCost>(
  product: T,
  permissions: Permission[],
): T | Omit<T, 'cost'> {
  if (canReadProductCost(permissions)) {
    return product;
  }
  return stripProductCost(product);
}

export function sanitizeProductDtoCost<T extends { cost?: number }>(
  dto: T,
  permissions: Permission[],
): T {
  if (canWriteProductCost(permissions)) {
    return dto;
  }
  const { cost: _cost, ...rest } = dto;
  return rest as T;
}
