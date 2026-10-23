import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RolePermissions, Permission } from '@fellow-crm/shared';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true; // Route doesn't require specific permissions
    }
    
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    
    if (!user) {
      return false;
    }

    // Super admin bypass
    if (user.role === 'super_admin') {
      return true;
    }

    const userPermissions = RolePermissions[user.role as keyof typeof RolePermissions] || [];
    
    const hasPermission = requiredPermissions.every((permission) => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }

    return true;
  }
}
