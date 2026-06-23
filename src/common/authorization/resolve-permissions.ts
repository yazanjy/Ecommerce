import { ROLE_PERMISSIONS, RoleType, PermissionType } from './role-permissions';

export function resolveUserPermissions(user: any): PermissionType[] {
  if (user.role === RoleType.SUPER_ADMIN) {
    return Object.values(PermissionType);
  }

  if (user.role !== RoleType.ADMIN) {
    return [];
  }

  const rolePermissions = ROLE_PERMISSIONS[user.role as RoleType] || [];
  const userPermissions = user.permissions || [];

  return [...new Set([...rolePermissions, ...userPermissions])];
}