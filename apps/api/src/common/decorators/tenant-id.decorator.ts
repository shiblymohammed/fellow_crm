import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const TenantId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    
    // Extracted from JWT token payload or custom header in middleware
    const tenantId = request.user?.tenantId;
    
    // We allow tenantId to be null for Super Admin actions
    if (tenantId === undefined) {
      throw new UnauthorizedException('Tenant context missing from request');
    }
    
    return tenantId;
  },
);
