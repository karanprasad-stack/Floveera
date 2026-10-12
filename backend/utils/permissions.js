export const ALL_PERMISSIONS = [
  'restaurant.view',
  'restaurant.manage',
  'orders.view',
  'orders.create',
  'orders.update',
  'orders.cancel',
  'customers.view',
  'customers.manage',
  'workers.view',
  'workers.manage',
  'menu.view',
  'menu.stock',
  'menu.manage',
  'inventory.view',
  'inventory.consume',
  'inventory.manage',
  'whatsapp.view',
  'whatsapp.send',
  'revenue.view',
  'expenses.view',
  'expenses.manage',
  'reports.view',
  'settings.manage'
];

export const RESTAURANT_ROLES = {
  RESTAURANT_ADMIN: 'RESTAURANT_ADMIN',
  RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',
  RESTAURANT_WORKER: 'RESTAURANT_WORKER',
  // Legacy aliases
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  ORDER_MANAGER: 'ORDER_MANAGER'
};

export const ROLE_PERMISSIONS = {
  RESTAURANT_ADMIN: [...ALL_PERMISSIONS],
  RESTAURANT_OWNER: [...ALL_PERMISSIONS],
  RESTAURANT_MANAGER: [
    'restaurant.view',
    'orders.view',
    'orders.update',
    'customers.view',
    'inventory.view',
    'inventory.consume',
    'inventory.manage',
    'reports.view',
    'whatsapp.view',
    'menu.view',
    'menu.stock'
  ],
  RESTAURANT_WORKER: [
    'restaurant.view',
    'orders.view',
    'orders.update',
    'menu.view',
    'menu.stock',
    'inventory.view',
    'inventory.consume'
  ],
  ORDER_MANAGER: [
    'restaurant.view',
    'orders.view',
    'orders.update',
    'menu.view',
    'menu.stock',
    'inventory.view',
    'inventory.consume'
  ]
};

/**
 * Resolves permissions for a user
 */
export function getUserPermissions(user) {
  if (!user) return [];
  // System admin has full access
  if (user.role === 'admin') {
    return [...ALL_PERMISSIONS];
  }

  const role = user.restaurantRole;
  if (!role || !ROLE_PERMISSIONS[role]) {
    return [];
  }

  const basePermissions = ROLE_PERMISSIONS[role] || [];
  const customPermissions = Array.isArray(user.customPermissions) ? user.customPermissions : [];

  return Array.from(new Set([...basePermissions, ...customPermissions]));
}
