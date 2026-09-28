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
  'menu.manage',
  'inventory.view',
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
  RESTAURANT_WORKER: 'RESTAURANT_WORKER',
  // Legacy aliases
  RESTAURANT_OWNER: 'RESTAURANT_OWNER',
  RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',
  ORDER_MANAGER: 'ORDER_MANAGER'
};

export const ROLE_PERMISSIONS = {
  RESTAURANT_ADMIN: [...ALL_PERMISSIONS],
  RESTAURANT_OWNER: [...ALL_PERMISSIONS],
  RESTAURANT_MANAGER: [...ALL_PERMISSIONS],
  RESTAURANT_WORKER: [
    'restaurant.view',
    'orders.view',
    'orders.update'
  ],
  ORDER_MANAGER: [
    'restaurant.view',
    'orders.view',
    'orders.update'
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
