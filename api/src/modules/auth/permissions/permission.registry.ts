export const PERMISSIONS = {
  DASHBOARD_READ: 'dashboard:read',
  ORDERS_READ: 'orders:read',
  ORDERS_WRITE: 'orders:write',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  PRODUCTS_COST_READ: 'products:cost:read',
  PRODUCTS_COST_WRITE: 'products:cost:write',
  MEDIA_WRITE: 'media:write',
  HOMEPAGE_WRITE: 'homepage:write',
  CATALOG_WRITE: 'catalog:write',
  SUPPLIERS_READ: 'suppliers:read',
  SUPPLIERS_WRITE: 'suppliers:write',
  STAFF_MANAGE: 'staff:manage',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

export const PERMISSION_LABELS: Record<Permission, string> = {
  [PERMISSIONS.DASHBOARD_READ]: 'View dashboard & insights',
  [PERMISSIONS.ORDERS_READ]: 'View orders',
  [PERMISSIONS.ORDERS_WRITE]: 'Manage orders',
  [PERMISSIONS.PRODUCTS_READ]: 'View products',
  [PERMISSIONS.PRODUCTS_WRITE]: 'Edit products',
  [PERMISSIONS.PRODUCTS_COST_READ]: 'View product costs',
  [PERMISSIONS.PRODUCTS_COST_WRITE]: 'Edit product costs',
  [PERMISSIONS.MEDIA_WRITE]: 'Upload & manage media',
  [PERMISSIONS.HOMEPAGE_WRITE]: 'Edit homepage',
  [PERMISSIONS.CATALOG_WRITE]: 'Manage categories & collections',
  [PERMISSIONS.SUPPLIERS_READ]: 'View suppliers',
  [PERMISSIONS.SUPPLIERS_WRITE]: 'Manage suppliers & orders',
  [PERMISSIONS.STAFF_MANAGE]: 'Manage staff & roles',
};

export const DEFAULT_STAFF_ROLE_PRESETS: Array<{
  name: string;
  slug: string;
  description: string;
  permissions: Permission[];
}> = [
  {
    name: 'Manager',
    slug: 'manager',
    description: 'Full store operations except staff management',
    permissions: ALL_PERMISSIONS.filter((p) => p !== PERMISSIONS.STAFF_MANAGE),
  },
  {
    name: 'Designer',
    slug: 'designer',
    description: 'Product imagery, media, and homepage content',
    permissions: [
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.PRODUCTS_WRITE,
      PERMISSIONS.MEDIA_WRITE,
      PERMISSIONS.HOMEPAGE_WRITE,
      PERMISSIONS.CATALOG_WRITE,
    ],
  },
  {
    name: 'Stock Auditor',
    slug: 'stock-auditor',
    description: 'Inventory, costs, and suppliers without insights dashboard',
    permissions: [
      PERMISSIONS.PRODUCTS_READ,
      PERMISSIONS.PRODUCTS_WRITE,
      PERMISSIONS.PRODUCTS_COST_READ,
      PERMISSIONS.PRODUCTS_COST_WRITE,
      PERMISSIONS.SUPPLIERS_READ,
      PERMISSIONS.SUPPLIERS_WRITE,
      PERMISSIONS.ORDERS_READ,
    ],
  },
];
