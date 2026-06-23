// src/common/authorization/role-permissions.ts
import { RoleType } from '../enum/role-type.enum';
import { PermissionType } from '../enum/permission.enum';

export { RoleType, PermissionType };

/**
 * 🗺️ خريطة توزيع الصلاحيات الافتراضية بناءً على رتبة المستخدم (Role)
 * * - الـ SUPER_ADMIN مصفوفته فارغة لأنه يملك Bypass كامل في الـ Guard (يمر تلقائياً).
 * - الـ ADMIN العادي يحصل تلقائياً على كافة صلاحيات إدارة المتجر المحددة أدناه.
 * - الـ PROVIDER والـ CUSTOMER يبدأون بمصفوفات فارغة ويمكن تخصيص صلاحيات لهم لاحقاً.
 */
export const ROLE_PERMISSIONS: Record<RoleType, PermissionType[]> = {
  [RoleType.SUPER_ADMIN]: [],

  [RoleType.MODERATOR]: [],
  [RoleType.MERCHANT]: [],
  [RoleType.SUPPORTER]: [],

  [RoleType.CUSTOMER]: [],

  [RoleType.ADMIN]: [
    PermissionType.MANAGE_USERS,
    PermissionType.MANAGE_PRODUCTS,
    PermissionType.MANAGE_ORDERS,
    PermissionType.MANAGE_CATEGORIES,
    PermissionType.MANAGE_DISCOUNTS,
    PermissionType.MANAGE_REVIEWS,
    PermissionType.MANAGE_SETTINGS,
    PermissionType.VIEW_ANALYTICS,
    PermissionType.MANAGE_CONTENT,
    PermissionType.MANAGE_PROMOTIONS,
    PermissionType.MANAGE_INVENTORY,
    PermissionType.MANAGE_SHIPPING,
    PermissionType.MANAGE_PAYMENTS,
    PermissionType.MANAGE_CUSTOMERS,
    PermissionType.MANAGE_REPORTS,
    PermissionType.MANAGE_SUPPORT,
    PermissionType.MANAGE_AFFILIATES,
    PermissionType.MANAGE_LOYALTY_PROGRAMS,
    PermissionType.MANAGE_SUBSCRIPTIONS,
    PermissionType.MANAGE_BLOG,
  ],
};
