import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/requires-feature.decorator';
import { PrismaClient } from '@prisma/client';

// Note: In a production app, we would inject a Redis service or PrismaService here
// rather than instantiating PrismaClient directly, but for now we'll use this or 
// expect the dependency to be injected.
const prisma = new PrismaClient();

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<string>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredFeature) {
      return true; // Route doesn't require a specific feature
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

    if (!user.tenantId) {
      throw new ForbiddenException('Tenant context missing');
    }

    // Check if tenant has the feature enabled
    // Ideally this should be cached in Redis
    const tenantFeature = await prisma.tenantFeature.findUnique({
      where: {
        tenantId_featureKey: {
          tenantId: user.tenantId,
          featureKey: requiredFeature,
        },
      },
    });

    if (!tenantFeature || !tenantFeature.isEnabled) {
      throw new ForbiddenException(`Your plan does not include access to: ${requiredFeature}`);
    }

    return true;
  }
}
