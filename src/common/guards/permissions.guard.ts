import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RoleType, ROLE_PERMISSIONS } from '../authorization/role-permissions';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>(
      PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    if (user.role === RoleType.SUPER_ADMIN) return true;
    if (user.role !== RoleType.ADMIN) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role as RoleType] || [];
    const userPermissions = user.permissions || [];

    const finalPermissions = [...new Set([...rolePermissions, ...userPermissions])];
    
    return requiredPermissions.every((permission) =>
      finalPermissions.includes(permission as any),
    );
  }
}