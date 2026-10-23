import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Inject } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorators/requires-feature.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}


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
    const cacheKey = `feature:${user.tenantId}:${requiredFeature}`;
    const cachedStatus = await this.cacheManager.get<boolean>(cacheKey);

    if (cachedStatus !== undefined) {
      if (!cachedStatus) {
        throw new ForbiddenException(`Your plan does not include access to: ${requiredFeature}`);
      }
      return true;
    }

    const tenantFeature = await this.prisma.tenantFeature.findUnique({
      where: {
        tenantId_featureKey: {
          tenantId: user.tenantId,
          featureKey: requiredFeature,
        },
      },
    });

    const isEnabled = tenantFeature ? tenantFeature.isEnabled : false;
    
    // Cache the result for 5 minutes (in milliseconds)
    await this.cacheManager.set(cacheKey, isEnabled, 300000);

    if (!isEnabled) {
      throw new ForbiddenException(`Your plan does not include access to: ${requiredFeature}`);
    }

    return true;
  }
}
