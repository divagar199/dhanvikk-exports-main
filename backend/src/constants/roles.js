export const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  MANAGER: 'manager',
  INVENTORY_MANAGER: 'inventory_manager',
  DELIVERY_MANAGER: 'delivery_manager',
  SUPER_ADMIN: 'super_admin',
};

export const STAFF_ROLES = [
  ROLES.ADMIN,
  ROLES.MANAGER,
  ROLES.INVENTORY_MANAGER,
  ROLES.DELIVERY_MANAGER,
  ROLES.SUPER_ADMIN,
];

export const ORDER_STATUS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing Floral Order',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};
